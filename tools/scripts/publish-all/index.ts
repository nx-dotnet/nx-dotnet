import { WorkspaceJsonConfiguration } from '@nrwl/devkit';

import { execSync } from 'child_process';
import { existsSync } from 'fs';

import { readJson, readWorkspaceJson } from '../../utils';
import { PatchPackageVersions } from '../patch-package-versions';

export function PublishAll(version: string, tag = 'latest') {
  const workspace: WorkspaceJsonConfiguration = readWorkspaceJson();
  const rootPkg = readJson('package.json');

  PatchPackageVersions(version, false);

  execSync('npx nx run-many --all --target="build"', {
    stdio: 'inherit',
  });

  const projects = Object.values(workspace.projects);
  const environment = {
    ...process.env,
    NPM_CONFIG_REGISTRY: undefined,
  };

  projects.forEach((projectConfiguration, idx) => {
    const outputPath = projectConfiguration.targets?.build?.options?.outputPath;
    if (existsSync(`${outputPath}/package.json`)) {
      execSync(`npm publish ${outputPath} --tag=${tag} --access=public`, {
        stdio: 'inherit',
        env: environment,
      });
    }
  });
}

if (require.main === module) {
  PublishAll(process.argv[2], process.argv[3] || 'latest');
}
