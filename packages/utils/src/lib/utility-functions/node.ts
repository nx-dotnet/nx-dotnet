/**
 * Wrapper around require.resolve for unit tests
 * @param m Module to resolve
 * @param resolver Method to use for resolving, defaults to require.resolve
 * @returns Absolute path to module file.
 */
export function resolve(m: string, resolver = require.resolve) {
  return resolver(m);
}
