import { workspaceRoot } from '@nx/devkit';
import { existsSync } from 'fs';
import { readJsonSync } from 'fs-extra';
import { join } from 'path';
import { readProjectsConfigurations } from './fs';

export function isDryRun() {
  return process.argv.includes('--dry-run');
}

export async function getWorkspacePackages(): Promise<string[]> {
  const { projects } = await readProjectsConfigurations();
  return Object.values(projects).reduce((packages, configuration) => {
    const path = join(workspaceRoot, configuration.root, 'package.json');
    if (existsSync(path)) {
      const { name, private: isPrivate } = readJsonSync(path);
      if (!isPrivate) {
        packages.push(name);
      }
    }
    return packages;
  }, [] as string[]);
}
