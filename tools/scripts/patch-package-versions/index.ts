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
  console.log('Got workspace');
  const rootPkg = readJson('package.json');
  if (newVersion && prebuild) {
    rootPkg.version = newVersion;
    writeJson('package.json', rootPkg);
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

    const p = prebuild
      ? projectConfiguration.root
      : projectConfiguration.targets?.build.options?.outputPath;
    const pkgPath = p ? `${p}/package.json` : null;
    if (!pkgPath || !existsSync(pkgPath)) {
      continue;
    }
    const pkg = readJson(pkgPath);
    pkg.version = newVersion;
    await patchDependenciesSection('dependencies', pkg, newVersion);
    console.log('Patched dependencies');
    await patchDependenciesSection('devDependencies', pkg, newVersion);
    console.log('Patched devDependencies');

    writeJson(pkgPath, pkg);

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
  PatchPackageVersions(args.version, args.project, false, true).then(() => {
    console.log('Done');
    process.exit(0);
  });
}
