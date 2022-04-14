import * as fg from 'fast-glob';
import { workspaceRoot } from 'nx/src/utils/app-root';
import { join } from 'path';

const globOptions = {
  cwd: workspaceRoot,
  ignore: ['**/bin/**', '**/obj/**'],
};

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
  return glob(`${path}/**/*.*proj`).then((results) => {
    if (!results || results.length === 0) {
      throw new Error(
        "Unable to find a build-able project within project's source directory!",
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
  const results = fg.sync(`${path}/**/*.*proj`, globOptions);
  if (!results || results.length === 0) {
    throw new Error(
      "Unable to find a build-able project within project's source directory!",
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
