import { ProjectsConfigurations } from '@nx/devkit';

import { execSync } from 'child_process';

import * as yargsParser from 'yargs-parser';

import {
  existsSync,
  getWorkspacePackages,
  readJson,
  readProjectsConfigurations,
  writeJson,
} from '../../utils';

export async function PatchPackageVersions(
  newVersion: string,
  pkg: string,
  updateGit = true,
  prebuild = false,
) {
  console.log('Patching package versions', newVersion, pkg);
  const workspace: ProjectsConfigurations = await readProjectsConfigurations();
  const rootPkg = readJson('package.json');
  if (newVersion && !process.env.NX_DOTNET_E2E) {
    rootPkg.version = newVersion;
    await writeJson('package.json', rootPkg);
  } else if (!newVersion) {
    newVersion = rootPkg.version;
  }

  if (updateGit) {
    execSync(`git add package.json`, {
      stdio: ['ignore', 'inherit', 'inherit'],
    });
  }

  const projects =
    pkg === 'all'
      ? Object.values(workspace.projects)
      : [workspace.projects[pkg]];

  for (let idx = 0; idx < projects.length; idx++) {
    const projectConfiguration = projects[idx];
    if (!projectConfiguration.targets?.build) {
      continue;
    }

    const pkgPath = `dist/${projectConfiguration.root}/package.json`;
    if (!pkgPath || !existsSync(pkgPath)) {
      continue;
    }
    const pkg = readJson(pkgPath);
    pkg.version = newVersion;
    await patchDependenciesSection('dependencies', pkg, newVersion);
    await patchDependenciesSection('devDependencies', pkg, newVersion);

    await writeJson(pkgPath, pkg);
    execSync(`yarn prettier --write ${pkgPath}`);
    console.log('Updated', pkgPath, 'for', newVersion);

    if (updateGit) {
      execSync(`git add ${pkgPath}`, {
        stdio: ['ignore', 'inherit', 'inherit'],
      });
      execSync(
        `git commit ${
          idx > 0 ? '--amend --no-edit' : '-m "chore(release): bump version"'
        }`,
        { stdio: ['ignore', 'inherit', 'inherit'] },
      );
    }
  }

  if (updateGit) {
    execSync(`git tag v${newVersion}`, {
      stdio: 'inherit',
    });
  }
}

async function patchDependenciesSection(
  section: 'dependencies' | 'devDependencies',
  packageJson: any,
  version: string,
) {
  const localPackages = await getWorkspacePackages();
  Object.keys(packageJson[section] || {}).forEach((pkg) => {
    if (localPackages.includes(pkg)) {
      packageJson[section][pkg] = version;
    }
  });
}

if (require.main === module) {
  const args = yargsParser(process.argv);
  PatchPackageVersions(
    args.version ?? process.env.NX_DOTNET_NEXT_VERSION,
    args.project,
    false,
    true,
  ).then(() => {
    console.log('Done');
    process.exit(0);
  });
}
