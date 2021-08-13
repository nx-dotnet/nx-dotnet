import { readJson } from 'fs-extra';
import { join } from 'path';

export async function readDependenciesFromNxCache(
  workspaceRoot: string,
  project: string,
) {
  const depGraphCachePath = join(
    workspaceRoot,
    'node_modules/.cache/nx/nxdeps.json',
  );

  const files: Array<{ file: string; deps: string[] }> = (
    await readJson(depGraphCachePath)
  ).nodes[project].data.files;
  return new Set(files.flatMap((x) => x.deps));
}
