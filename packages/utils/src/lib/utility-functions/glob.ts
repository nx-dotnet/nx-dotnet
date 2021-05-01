import * as _glob from 'glob';

/**
 * Wraps the glob package in a promise api.
 * @returns array of file paths
 */
export function glob(path: string): Promise<string[]> {
  return new Promise((resolve, reject) =>
    _glob(path, (err, matches) => (err ? reject() : resolve(matches))),
  );
}

export function findProjectFileInPath(path: string): Promise<string> {
  console.log(`Looking for project files at '${path}/**/*.*proj'`);

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
  console.log(`Looking for project files at '${path}/**/*.*proj'`);

  const results = _glob.sync(`${path}/**/*.*proj`);
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
