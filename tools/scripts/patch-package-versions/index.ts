import { WorkspaceJsonConfiguration } from '@nrwl/devkit';
import { execSync } from 'child_process';
import { existsSync, readJson, writeJson } from '../../utils';

export function PatchPackageVersions(newVersion: string) {
  execSync('npx nx run-many --all --target="build" --with-deps', {
    stdio: 'inherit',
  });

  const workspace: WorkspaceJsonConfiguration = readJson('workspace.json');
  const rootPkg = readJson('package.json');

  rootPkg.version = newVersion;
  writeJson('package.json', rootPkg);
  execSync(`git add package.json`, {
    stdio: ['ignore', 'inherit', 'inherit'],
  });

  const projects = Object.values(workspace.projects);

  projects.forEach((projectConfiguration, idx) => {
    const outputPath = projectConfiguration.targets?.build?.options?.outputPath;
    const pkgPath = `${projectConfiguration.root}/package.json`;
    if (!existsSync(pkgPath)) {
        console.log('pkgPath not found', pkgPath)
      return;
    }
    const pkg = readJson(pkgPath);
    pkg.version = newVersion;
    Object.entries(pkg.dependencies || {}).forEach(([dep, version]) => {
      if (dep.includes('@nx-dotnet')) pkg.dependencies[dep] = newVersion;
    });
    writeJson(pkgPath, pkg);
    writeJson(outputPath + '/package.json', pkg);
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

if (require.main) {
    PatchPackageVersions(process.argv[2])
}
