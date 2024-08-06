import changelogRenderer from 'nx/release/changelog-renderer';
import type { Octokit } from '@octokit/rest';

const dynamicImport = async (path: string) => {
  return new Function(`return import('${path}')`)();
};

const wrapped: typeof changelogRenderer = async (opts) => {
  const client: Octokit = await dynamicImport('@octokit/rest').then(
    (m) =>
      new m.Octokit({ auth: process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN }),
  );
  for (const change of opts.changes ?? []) {
    for (const ref of change.githubReferences ?? []) {
      if (ref.type === 'issue' || ref.type === 'pull-request') {
        await handleIssueOrPr(client, ref.value, opts.releaseVersion);
      }
    }
  }
  return changelogRenderer(opts);
};

export default wrapped;

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

  await client.issues.createComment({
    owner: 'nx-dotnet',
    repo: 'nx-dotnet',
    issue_number: num,
    body: bodyLines.join('\n'),
  });
}
