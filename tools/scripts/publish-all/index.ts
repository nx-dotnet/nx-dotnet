import { WorkspaceJsonConfiguration } from '@nrwl/devkit';
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { readJson } from '../../utils';
import { PatchPackageVersions } from '../patch-package-versions';

export function PublishAll(version, tag) {
  const workspace: WorkspaceJsonConfiguration = readJson('workspace.json');
  const rootPkg = readJson('package.json');
  PatchPackageVersions(version);
  const projects = Object.values(workspace.projects);

  projects.forEach((projectConfiguration, idx) => {
    const outputPath = projectConfiguration.targets?.build?.options?.outputPath;
    if (existsSync(`${outputPath}/package.json`)) {
      execSync(
        `npm publish ${outputPath} --tag=${tag} --new-version=${
          version || rootPkg.version
        } --access=public`,
        { stdio: 'inherit' }
      );
    }
  });
}

if (require.main === module) {
  PublishAll(process.argv[2], process.argv[3]);
}
