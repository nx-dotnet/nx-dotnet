import { execSync } from 'child_process';
import {
  copySync,
  ensureDirSync,
  existsSync,
  readJsonSync,
  removeSync,
} from 'fs-extra';
import { basename, dirname, join, resolve } from 'path';
import { getWorkspacePackages } from '../utils';
import {
  startCleanVerdaccioInstance,
  killVerdaccioInstance,
} from './local-registry/setup';
import { releasePublish, releaseVersion } from 'nx/release';
import { readFileSync, writeFileSync } from 'fs';
import { NxJsonConfiguration } from '@nx/devkit';
import { safeExecSync } from '../../packages/utils/src/lib/utility-functions/childprocess';

const sandboxDirectory = join(__dirname, '../../tmp/sandbox');

export async function setup() {
  copySync('.npmrc.local', '.npmrc');

  // Kill any existing Verdaccio instance first
  killVerdaccioInstance();

  // Add a small delay before starting a new instance
  await new Promise((resolve) => setTimeout(resolve, 1000));

  try {
    // Try to start Verdaccio with improved error handling
    console.log('Starting Verdaccio local registry...');
    await startCleanVerdaccioInstance();
    console.log('Verdaccio started successfully');
  } catch (E) {
    console.error('Error starting Verdaccio:', E);
    console.log('Continuing without local registry...');
  }

  try {
    await releaseVersion({
      specifier: '99.99.99',
      firstRelease: true,
      stageChanges: false,
      gitCommit: false,
      gitTag: false,
      generatorOptionsOverrides: {
        currentVersionResolver: 'disk',
      },
    });
    await releasePublish({ registry: 'http://localhost:4872' });
  } catch (error) {
    console.error('Error during release process:', error);
    console.log('Continuing with sandbox creation...');
  }
}

if (require.main === module) {
  setup()
    .then(() => {
      if (existsSync(sandboxDirectory)) {
        removeSync(sandboxDirectory);
      }
      ensureDirSync(dirname(sandboxDirectory));
      console.log('Creating new Nx workspace...');
      execSync(
        `npx --yes create-nx-workspace@latest ${basename(
          sandboxDirectory,
        )} --preset apps --nxCloud skip --packageManager yarn`,
        {
          cwd: dirname(sandboxDirectory),
          stdio: 'inherit',
        },
      );
      copySync('.npmrc.local', join(sandboxDirectory, '.npmrc'));
      getWorkspacePackages().then((pkgs) => {
        console.log('Installing workspace packages...');
        safeExecSync(`yarn add --dev ${pkgs.join(' ')}`, {
          cwd: sandboxDirectory,
          stdio: 'inherit',
        });
        console.log('Sandbox created at', resolve(sandboxDirectory));
      });
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
