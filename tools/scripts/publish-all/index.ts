import { WorkspaceJsonConfiguration } from '@nx/devkit';

import { execSync } from 'child_process';
import { existsSync } from 'fs';

import { readJson, readWorkspaceJson } from '../../utils';
import { PatchPackageVersions } from '../patch-package-versions';

export function publishAll(version: string, tag = 'latest') {
  const workspace: WorkspaceJsonConfiguration = readWorkspaceJson();
  const rootPkg = readJson('package.json');

  execSync('npx nx run-many --all --target="build" --exclude="docs-site"', {
    stdio: 'inherit',
  });

  PatchPackageVersions(version, 'all', false);

  const projects = Object.values(workspace.projects);
  const environment = {
    ...process.env,
    NPM_CONFIG_REGISTRY: undefined,
  };

  for (const projectConfiguration of projects) {
    if (projectConfiguration.root.includes('demo')) {
      continue;
    }
    const outputPath = projectConfiguration.targets?.build?.options?.outputPath;
    if (existsSync(`${outputPath}/package.json`)) {
      execSync(`npm publish ${outputPath} --tag=${tag} --access=public`, {
        stdio: 'inherit',
        env: environment,
      });
    }
  }
}

if (require.main === module) {
  publishAll(process.argv[2], process.argv[3] || 'latest');
}
