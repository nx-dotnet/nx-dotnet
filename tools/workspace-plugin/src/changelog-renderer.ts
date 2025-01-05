import DefaultChangelogRenderer from 'nx/release/changelog-renderer';
import type { Octokit } from '@octokit/rest';

const dynamicImport = async (path: string) => {
  return new Function(`return import('${path}')`)();
};

export default class extends DefaultChangelogRenderer {
  override async render(): Promise<string> {
    const client: Octokit = await dynamicImport('@octokit/rest').then(
      (m) =>
        new m.Octokit({
          auth: process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN,
        }),
    );
    for (const change of this.changes ?? []) {
      for (const ref of change.githubReferences ?? []) {
        if (ref.type === 'issue' || ref.type === 'pull-request') {
          await handleIssueOrPr(client, ref.value, this.changelogEntryVersion);
        }
      }
    }
    return await super.render();
  }
}

async function handleIssueOrPr(
  client: Octokit,
  ref: string,
  nextVersion: string,
) {
  const num = parseInt(ref.replace('#', ''));
  if (isNaN(num)) {
    return null;
  }

  const issue = await client.issues.get({
    owner: 'nx-dotnet',
    repo: 'nx-dotnet',
    issue_number: num,
  });

  if (issue.data.body && issue.data.pull_request) {
    const regex = /([Ff]ix(es)?|[Rr]esolves|[Cc]loses) #(?<issue>\d+)/gm;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(issue.data.body)) !== null) {
      await handleIssueOrPr(client, match.groups?.issue ?? '', nextVersion);
    }
  }

  const bodyLines = [];

  if (issue.data.pull_request) {
    bodyLines.push(`🎉 This PR has been released in ${nextVersion} 🎉`);
  } else {
    if (issue.data.labels.includes('bug')) {
      bodyLines.push(
        `🐛🔫  🎉 This bug has been fixed in ${nextVersion} 🎉  🐛🔫`,
      );
    } else {
      bodyLines.push(`🎉 This issue has been resolved in ${nextVersion} 🎉`);
    }
  }

  bodyLines.push(
    ``,
    `The release is available on:`,
    `- [npm](https://www.npmjs.com/package/@nx-dotnet/core)`,
    `- [github](https://github.com/nx-dotnet/nx-dotnet/releases/tag/v${nextVersion})`,
    `- [v${nextVersion}](https://github.com/nx-dotnet/nx-dotnet/tree/v${nextVersion})`,
    ``,
    `Please test and let us know if there are any issues 🎉`,
  );

  if (
    process.env.DRY_RUN ||
    process.argv.includes('--dry-run') ||
    process.argv.includes('-d')
  ) {
    console.log(`Would have commented on #${ref}`);
    console.log('');
    console.log('---');
    console.log(bodyLines.map((l) => '\t' + l).join('\n'));
    console.log('---');
    return;
  }
  try {
    await client.issues.createComment({
      owner: 'nx-dotnet',
      repo: 'nx-dotnet',
      issue_number: num,
      body: bodyLines.join('\n'),
    });
  } catch {
    // This could have failed for several reasons, but its not worth
    // failing the release process because of a changelog comment not
    // being posted. Possible reasons include:
    // - The issue is locked
    // - We are out of API requests
    // - Github is experiencing issues
  }
}
