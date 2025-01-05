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
import { startCleanVerdaccioInstance } from './local-registry/setup';
import { releasePublish, releaseVersion } from 'nx/release';

const sandboxDirectory = join(__dirname, '../../tmp/sandbox');

export async function setup() {
  copySync('.npmrc.local', '.npmrc');
  try {
    await startCleanVerdaccioInstance();
  } catch (E) {
    throw E;

    // Its ok.
  }

  await releaseVersion({
    specifier: '99.99.99',
    firstRelease: true,
    generatorOptionsOverrides: {
      currentVersionResolver: 'disk',
    },
  });
  await releasePublish({ registry: 'http://localhost:4872' });
}

if (require.main === module) {
  setup()
    .then(() => {
      if (existsSync(sandboxDirectory)) {
        removeSync(sandboxDirectory);
      }
      ensureDirSync(dirname(sandboxDirectory));
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
        execSync(`yarn add --dev ${pkgs.join(' ')}`, {
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
