import { ProjectConfiguration } from '@nrwl/devkit';
import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { existsSync, getAffectedProjects, isDryRun } from '../../utils';

export async function main(all = false, specific?: string) {
  const projects = getAffectedProjects(all, specific);

  const files: { [key: string]: string[] } = {};

  projects.forEach((x, idx) => {
    const projectConfiguration: ProjectConfiguration = readProjectConfiguration(
      x
    );
    const outputPath = projectConfiguration.targets?.build?.options?.outputPath;
    const pkg = `${projectConfiguration.root}/package.json`;
    if (outputPath && existsSync(pkg)) {
      files[x] = [];
      const v = readJson(pkg);
      const [prev, tag] = v.version.split('-');
      let [branch, rev] = tag ? tag.split('.') : ['dev', '0'];
      let succeeded = false;
      while (!succeeded) {
        rev = (parseInt(rev) + 1).toString();
        rev = rev === 'NaN' ? '0' : rev;
        const newVersion = `${prev}-${branch}.${rev}`;
        writeJson(pkg, { ...v, version: newVersion });
        files[x].push(pkg);
        if (!isDryRun()) {
          try {
            execSync(
              `yarn publish --tag dev --new-version ${newVersion} --no-git-tag-version`,
              { stdio: 'inherit', cwd: outputPath }
            );
            execSync(`git add ${pkg}`, { stdio: ['ignore', 'inherit', 'inherit'] });
            execSync(
              `git commit ${
                idx > 0 ? '--amend --no-edit' : '-m "chore(): bump version"'
              }`,
              { stdio: ['ignore', 'inherit', 'inherit'] }
            );
            execSync(`git tag ${x}-v${newVersion}`, {
              stdio: 'inherit',
            });
            succeeded = true;
          } catch{
            succeeded = false;
          }
        } else {
          succeeded = true;
        }
      }
    }
  });
}

function readProjectConfiguration(projectName) {
  return JSON.parse(readFileSync('workspace.json').toString())['projects'][
    projectName
  ];
}

function readJson(path: string) {
  return JSON.parse(readFileSync(path).toString());
}

function writeJson(path: string, object) {
  return writeFileSync(path, JSON.stringify(object, null, 2));
}

if (require.main === module) {
  main();
}
