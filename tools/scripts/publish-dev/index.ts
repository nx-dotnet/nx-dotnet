import { WorkspaceJsonConfiguration } from '@nrwl/devkit';
import { execSync } from 'child_process';
import { existsSync, readJson } from '../../utils';
import { PatchPackageVersions } from '../patch-package-versions';
import { PublishAll } from '../publish-all';

export function main(all = false, specific?: string) {
  const workspace: WorkspaceJsonConfiguration = readJson('workspace.json');
  const rootPkg = readJson('package.json');

  const [prev, tagSpec] = rootPkg.version.split('-');
  let [tag, rev] = tagSpec ? tagSpec.split('.') : ['dev', '0'];
  rev = (parseInt(rev) + 1).toString();
  rev = rev === 'NaN' ? '0' : rev;
  const newVersion = `${prev}-${tag}.${rev}`;
  console.log('New Version: ', { newVersion, prev, tag, rev });

  PublishAll(newVersion, tag);
}

if (require.main === module) {
  main();
}
