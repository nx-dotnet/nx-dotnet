import { WorkspaceJsonConfiguration } from '@nrwl/devkit';
import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { readJson, writeJson } from '../../utils';
import { PatchPackageVersions } from '../patch-package-versions';

const MAX_ATTEMPTS = 5;

export async function main(all = false, specific?: string) {
  const workspace: WorkspaceJsonConfiguration = readJson('workspace.json');
  const rootPkg = readJson('package.json');

  const [prev, tag] = rootPkg.version.split('-');
  let [branch, rev] = tag ? tag.split('.') : ['dev', '0'];
  rev = (parseInt(rev) + 1).toString();
  rev = rev === 'NaN' ? '0' : rev;
  const newVersion = `${prev}-${branch}.${rev}`;

  PatchPackageVersions(newVersion);

  const projects = Object.values(workspace.projects);

  projects.forEach((projectConfiguration, idx) => {
    const outputPath = projectConfiguration.targets?.build?.options?.outputPath;
    execSync(
      `npm publish ${outputPath} --tag=dev --new-version=${newVersion} --access=public`,
      { stdio: 'inherit' }
    );
  });
}

if (require.main === module) {
  main();
}
