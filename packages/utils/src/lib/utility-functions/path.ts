import { isAbsolute, resolve } from 'path';

/**
 * Returns the absolute path of a file or directory.
 * @param path The path to resolve.
 * @param maybeRoot The root to resolve from.
 * @returns The absolute path.
 */
export function getAbsolutePath(path: string, maybeRoot: string) {
  if (isAbsolute(path)) {
    return path;
  }
  return resolve(maybeRoot, path);
}
