import { workspaceRoot } from '@nx/devkit';
import { existsSync } from 'fs';
import { readJsonSync } from 'fs-extra';
import { join } from 'path';
import { readWorkspaceJson } from './fs';

export function isDryRun() {
  return process.argv.includes('--dry-run');
}

export function getWorkspacePackages(): string[] {
  const w = readWorkspaceJson();
  return Object.values(w.projects).reduce((packages, configuration) => {
    const path = join(workspaceRoot, configuration.root, 'package.json');
    if (existsSync(path)) {
      const { name } = readJsonSync(path);
      packages.push(name);
    }
    return packages;
  }, [] as string[]);
}
