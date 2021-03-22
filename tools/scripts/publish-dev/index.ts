import {
  ProjectConfiguration,
} from '@nrwl/devkit';
import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { existsSync, getAffectedProjects, isDryRun } from '../../utils';

export default async function (
 all = false,
 specific?: string
) {
  const projects = getAffectedProjects(all, specific);
  
  const files: {[key: string]: string[]} = {}
  
  projects.forEach((x, idx) => {
    const projectConfiguration: ProjectConfiguration = readProjectConfiguration(x);
    const outputPath = projectConfiguration.targets?.build?.options?.outputPath;
    const pkg = `${projectConfiguration.root}/package.json`;
    if (outputPath && existsSync(pkg)) {
      files[x] = [];
      const v = readJson(pkg);
      const [prev, tag] = v.version.split('-');
      const [branch, rev] = tag ? tag.split('.') : ['dev', '0'];
      const newVersion = `${prev}-${branch}.${parseInt(rev) + 1}`;
      writeJson(pkg, { ...v, version: newVersion });
      files[x].push(pkg);
      if (!isDryRun()) {
        execSync(
          `yarn publish --tag dev --new-version ${newVersion} --no-git-tag-version`,
          { stdio: 'inherit', cwd: outputPath }
        );
        execSync(`git add ${pkg}`, {stdio: ['ignore', 'inherit', 'inherit']});
        execSync(`git commit ${idx > 0 ? '--amend --no-edit' : '-m "chore(): bump version"'}`, {stdio: ['ignore', 'inherit', 'inherit']});
        execSync(`git tag ${x}v${newVersion} &&`, {
          stdio: 'inherit',
        });
      }
    }
  });
  if (!isDryRun()) {
    execSync(`git push`, {stdio: 'inherit'})
  }
}

function readProjectConfiguration(projectName) {
  return JSON.parse(readFileSync('workspace.json').toString())['projects']['projectName'];
}

function readJson(path: string) {
  return JSON.parse(readFileSync(path).toString());
}

function writeJson(path: string, object) {
  return writeFileSync(path, JSON.stringify(object, null, 2));
}
