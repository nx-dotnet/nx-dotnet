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

/**
 * Transforms an object of parameters into an array of strings with key followed by the corresponding value.
 * @param parameters Parameters to transform into CLI arguments
 * @returns Parameter string to be appended to CLI command
 */
export function getSpawnParameterArray(
  parameters: Record<string, boolean | string>,
): string[] {
  const spawnArray: string[] = [];
  for (const [key, value] of Object.entries(parameters)) {
    if (typeof value === 'boolean') {
      if (value) {
        spawnArray.push(`--${key}`);
      }
    } else if (value !== undefined && value !== null) {
      spawnArray.push(`--${key}`, value.toString());
    }
  }
  return spawnArray;
}
