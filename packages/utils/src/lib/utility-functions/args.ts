export function isDryRun(): boolean {
  return process.argv.some((x) => x === '--dry-run');
}

export function swapKeysUsingMap(
  object: Record<string, string | boolean>,
  map: Record<string, string>,
): Record<string, string | boolean> {
  return Object.fromEntries(
    Object.entries(object).map(([key, value]) => [
      key in map ? map[key] : key,
      value,
    ]),
  );
}

export function swapExplicitFalseKeys<
  TRecord extends Record<string, string | boolean>,
>(
  object: TRecord,
  explicitFalseKeys: readonly (keyof TRecord)[],
): Record<string, string | boolean> {
  return Object.fromEntries(
    Object.entries(object).map(([key, value]) => [
      key,
      explicitFalseKeys.includes(key) && value === false ? 'false' : value,
    ]),
  ) as Record<string, string | boolean>;
}
