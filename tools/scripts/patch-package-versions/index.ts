import { WorkspaceJsonConfiguration } from '@nrwl/devkit';
import { Workspaces } from '@nrwl/tao/src/shared/workspace';

import { execSync } from 'child_process';
import { join } from 'path';

import * as yargsParser from 'yargs-parser';

import {
  existsSync,
  getWorkspacePackages,
  readJson,
  readWorkspaceJson,
  writeJson,
} from '../../utils';

export function PatchPackageVersions(
  newVersion: string,
  pkg: string,
  updateGit = true,
  prebuild = false,
) {
  const workspace: WorkspaceJsonConfiguration = readWorkspaceJson();
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

  projects.forEach((projectConfiguration, idx) => {
    if (!projectConfiguration.targets?.build) {
      return;
    }

    const p = prebuild
      ? projectConfiguration.root
      : projectConfiguration.targets?.build.options?.outputPath;
    const pkgPath = p ? `${p}/package.json` : null;
    if (!pkgPath || !existsSync(pkgPath)) {
      console.log('pkgPath not found:', pkgPath);
      return;
    }
    const pkg = readJson(pkgPath);
    pkg.version = newVersion;
    patchDependenciesSection('dependencies', pkg, newVersion);
    patchDependenciesSection('devDependencies', pkg, newVersion);

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
  });

  if (updateGit) {
    execSync(`git tag v${newVersion}`, {
      stdio: 'inherit',
    });
  }
}

function patchDependenciesSection(
  section: 'dependencies' | 'devDependencies',
  packageJson: any,
  version: string,
) {
  const localPackages = getWorkspacePackages();
  Object.keys(packageJson[section] || {}).forEach((pkg) => {
    if (localPackages.includes(pkg)) {
      packageJson[section][pkg] = version;
    }
  });
}

if (require.main === module) {
  const args = yargsParser(process.argv);
  PatchPackageVersions(args.version, args.project, false, true);
}
