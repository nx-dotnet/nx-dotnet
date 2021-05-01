export function isDryRun(): boolean {
  return process.argv.some((x) => x === '--dry-run');
}

export function swapKeysUsingMap(
  object: Record<string, unknown>,
  map: Record<string, string>,
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(object).map(([key, value]) => [
      key in map ? map[key] : key,
      value,
    ]),
  );
}

export function swapArrayFieldValueUsingMap<T>(
  array: T[],
  field: keyof T,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  map: any,
) {
  return array.map((x) => ({
    ...x,
    field: map[x[field]] ?? x[field],
  }));
}
