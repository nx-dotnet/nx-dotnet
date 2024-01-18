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
  parameters: Record<string, boolean | string | number | undefined | null>,
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

/**
 * The needed configuration to convert an object of options into an array of CLI parameters.
 */
export interface CommandLineParamFixes<TKey extends string> {
  /**
   * A map of the option keys and what those flags are named in the cli
   */
  keyMap: Partial<Record<TKey, string>>;
  /**
   * These are keys that need to be passed as `--key false` instead of not including in the flags
   */
  explicitFalseKeys: readonly TKey[];
}

/**
 * Converts an object of options like `{ noBuild: true }`into an array of CLI parameters like `["--no-build"]`
 * Will run a conversion process to change every option to a string, and will map keys to different flags if needed.
 */
export function convertOptionsToParams<TKey extends string>(
  options: Partial<Record<TKey, string | boolean | number | undefined | null>>,
  fixes: CommandLineParamFixes<TKey>,
): string[] {
  const entries = Object.entries(options).map(([key, value]) => [
    key in fixes.keyMap ? fixes.keyMap[key as TKey] : key,
    (fixes.explicitFalseKeys as readonly string[]).includes(key) &&
    value === false
      ? 'false'
      : value,
  ]);
  return getSpawnParameterArray(Object.fromEntries(entries));
}
