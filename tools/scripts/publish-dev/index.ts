import { WorkspaceJsonConfiguration } from '@nrwl/devkit';
import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';

const MAX_ATTEMPTS = 5;

export async function main(all = false, specific?: string) {
  execSync('npx nx run-many --all --target="build" --with-deps', {stdio: 'inherit'});

  const workspace: WorkspaceJsonConfiguration = readJson('workspace.json');
  const rootPkg = readJson('package.json');

  const [prev, tag] = rootPkg.version.split('-');
  let [branch, rev] = tag ? tag.split('.') : ['dev', '0'];
  rev = (parseInt(rev) + 1).toString();
  rev = rev === 'NaN' ? '0' : rev;
  const newVersion = `${prev}-${branch}.${rev}`;

  rootPkg.version = newVersion;
  writeJson('package.json', rootPkg);

  const projects = Object.values(workspace.projects);

  projects.forEach((projectConfiguration, idx) => {
    const outputPath = projectConfiguration.targets?.build?.options?.outputPath;
    const pkgPath = `${projectConfiguration.root}/package.json`;
    if (!existsSync(pkgPath)) {
      return;
    }
    const pkg = readJson(pkgPath);
    pkg.version = newVersion;
    Object.entries(pkg.dependencies || {}).forEach(([dep, version]) => {
      if (dep.includes('@nx-dotnet')) pkg.dependencies[dep] = newVersion;
    });
    writeJson(pkgPath, pkg);
    writeJson(outputPath + '/package.json', pkg);
    execSync(
      `npm publish ${outputPath} --tag=dev --new-version=${newVersion} --access=public`,
      { stdio: 'inherit' }
    );
    execSync(`git add ${pkgPath}`, {
      stdio: ['ignore', 'inherit', 'inherit'],
    });
    execSync(
      `git commit ${
        idx > 0 ? '--amend --no-edit' : '-m "chore(): bump version"'
      }`,
      { stdio: ['ignore', 'inherit', 'inherit'] }
    );
  });

  execSync(`git tag v${newVersion}`, {
    stdio: 'inherit',
  });
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
