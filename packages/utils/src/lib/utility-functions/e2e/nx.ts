import { execSync } from 'child_process';
import { readJson, remove } from 'fs-extra';
import { join } from 'path';

export async function readDependenciesFromNxDepGraph(
  workspaceRoot: string,
  project: string,
) {
  const depGraphFile = join('tmp', 'dep-graph.json');
  execSync(`npx nx dep-graph --file ${depGraphFile}`, {
    cwd: workspaceRoot,
    stdio: 'inherit',
  });
  const absolutePath = join(workspaceRoot, depGraphFile);
  const { graph } = await readJson(absolutePath);
  await remove(absolutePath);

  const deps: Array<{ source: string; target: string }> =
    graph.dependencies[project];
  console.log('[E2E]: Found dependencies', deps);
  return new Set(deps.map((x) => x.target));
}
