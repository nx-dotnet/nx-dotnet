import { workspaceRoot } from '@nrwl/devkit';

import * as fg from 'fast-glob';
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
export function glob(path: string, cwd?: string): Promise<string[]> {
  return fg(
    path,
    !cwd ? globOptions : { ...globOptions, cwd: join(workspaceRoot, cwd) },
  );
}

export function findProjectFileInPath(path: string): Promise<string> {
  return glob(projPattern(path)).then((results) => {
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
  });
}

export function findProjectFileInPathSync(path: string): string {
  const results = fg.sync(projPattern(path), globOptions);
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
