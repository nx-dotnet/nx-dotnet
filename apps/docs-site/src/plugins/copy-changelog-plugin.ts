import { workspaceRoot } from '@nx/devkit';
import { frontMatter, lines } from 'markdown-factory';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export async function CopyChangelogPlugin() {
  const changelog = readFileSync(
    join(workspaceRoot, './CHANGELOG.md'),
    'utf-8',
  );

  writeFileSync(
    join(__dirname, '../../../../docs/CHANGELOG.md'),
    addFrontMatter(escapeEmailAddresses(escapeTokens(changelog)), {
      id: 'changelog',
      title: 'Changelog',
      hide_title: true,
      sidebar_position: 1,
      slug: '/changelog',
    }),
  );

  return {
    // a unique name for this plugin
    name: 'copy-readme-and-changelog-plugin',
  };
}

function escapeEmailAddresses(content: string) {
  return content.replaceAll(/<(.*@.*)>/g, '&lt;<a href="mailto:$1">$1</a>&gt;');
}

function escapeTokens(content: string) {
  const transformed: string[] = [];
  let insideCodeBlock = false;
  let insideInlineCode = false;
  for (const character of content) {
    if (
      character === '`' &&
      transformed[transformed.length - 1] !== '\\' &&
      !insideCodeBlock
    ) {
      insideInlineCode = !insideInlineCode;
    }

    if (
      character === '`' &&
      // Check if there are at least 3 backticks
      transformed.length >= 2 &&
      !insideInlineCode &&
      transformed.slice(-2).every((c) => c === '`') &&
      (transformed.length == 2 || transformed[transformed.length - 3] !== '\\')
    ) {
      insideCodeBlock = !insideCodeBlock;
    }

    if (character === '{' && !insideCodeBlock && !insideInlineCode) {
      transformed.push('\\');
    }

    if (character === '}' && !insideCodeBlock && !insideInlineCode) {
      transformed.push('\\');
    }

    transformed.push(character);
  }
  return transformed.join('');
}

function addFrontMatter(
  contents: string,
  frontMatterContents: Record<string, string | boolean | number>,
) {
  return lines(frontMatter(frontMatterContents), contents);
}
