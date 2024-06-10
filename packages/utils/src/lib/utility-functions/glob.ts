import { Tree, workspaceRoot, glob as devkitGlob } from '@nx/devkit';

import fg = require('fast-glob');

import { join } from 'path';

const globOptions: fg.Options = {
  cwd: workspaceRoot,
  ignore: ['**/bin/**', '**/obj/**'],
  dot: true,
};

export function projPattern(path: string): string {
  return `${path}/**/*.@(cs|fs|vb|sql)proj`;
}

/**
 * Wraps the fast-glob package.
 * @returns array of file paths
 */
export function glob(
  path: string,
  cwd?: string,
  tree?: Tree,
): string[] | Promise<string[]> {
  if (tree) {
    return devkitGlob(tree, [path]);
  }
  return fg(
    path,
    !cwd ? globOptions : { ...globOptions, cwd: join(workspaceRoot, cwd) },
  );
}

export function globSync(path: string, cwd?: string, tree?: Tree) {
  if (tree) {
    return devkitGlob(tree, [path]);
  }
  return fg.sync(
    path,
    !cwd ? globOptions : { ...globOptions, cwd: join(workspaceRoot, cwd) },
  );
}

export async function findProjectFileInPath(
  path: string,
  tree?: Tree,
): Promise<string> {
  const results = await glob(projPattern(path), undefined, tree);

  if (!results || results.length === 0) {
    throw new Error(
      `Unable to find a build-able project within project's source directory!
- Looked in: ${path}`,
    );
  }

  if (results.length > 1) {
    throw new Error(
      `More than one build-able projects are contained within the project's source directory! \r\n ${results.join(
        ', \r\n',
      )}`,
    );
  }
  return results[0];
}

export function findProjectFileInPathSync(path: string, tree?: Tree): string {
  const results = globSync(projPattern(path), undefined, tree);
  if (!results || results.length === 0) {
    throw new Error(
      `Unable to find a build-able project within project's source directory!
- Looked in: ${path}`,
    );
  }

  if (results.length > 1) {
    throw new Error(
      `More than one build-able projects are contained within the project's source directory! \r\n ${results.join(
        ', \r\n',
      )}`,
    );
  }
  return results[0];
}
