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

const sandboxDirectory = join(__dirname, '../../tmp/sandbox');

export function setup() {
  copySync('.npmrc.local', '.npmrc');
  try {
    startCleanVerdaccioInstance();
  } catch {
    // Its ok.
  }
  execSync('ts-node ./tools/scripts/publish-all 99.99.99 local', {
    env: {
      ...process.env,
      NPM_CONFIG_REGISTRY: 'http://localhost:4872',
      YARN_REGISTRY: 'http://localhost:4872',
    },
  });
}

if (require.main === module) {
  setup();
  if (existsSync(sandboxDirectory)) {
    removeSync(sandboxDirectory);
  }
  ensureDirSync(dirname(sandboxDirectory));
  execSync(
    `npx create-nx-workspace@latest ${basename(
      sandboxDirectory,
    )} --preset empty --no-nxCloud --packageManager yarn`,
    {
      cwd: dirname(sandboxDirectory),
      stdio: 'inherit',
    },
  );
  copySync('.npmrc.local', join(sandboxDirectory, '.npmrc'));
  getWorkspacePackages()
    .then((pkgs) => {
      execSync(`yarn add --dev ${pkgs}`, {
        cwd: sandboxDirectory,
        stdio: 'inherit',
      });
      console.log('Sandbox created at', resolve(sandboxDirectory));
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
