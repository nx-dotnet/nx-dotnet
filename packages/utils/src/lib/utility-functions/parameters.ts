/**
 * Transforms an object of parameters into a string.
 * @param parameters Parameters to transform into CLI arguments
 * @returns Parameter string to be appended to CLI command
 */
export function getParameterString(
  parameters: Record<string, boolean | string>,
): string {
  return Object.entries(parameters).reduce((acc, [flag, value]) => {
    if (typeof value === 'boolean' || !value) {
      if (value) {
        return acc + `--${flag} `;
      } else {
        return acc;
      }
    } else {
      return acc + `--${flag} ${value} `;
    }
  }, '');
}
