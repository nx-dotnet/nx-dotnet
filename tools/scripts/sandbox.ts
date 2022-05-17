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
import { workspaceRoot } from 'nx/src/utils/app-root';
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
  execSync(`yarn add --dev ${getWorkspacePackages().join(' ')}`, {
    cwd: sandboxDirectory,
    stdio: 'inherit',
  });
  console.log('Sandbox created at', resolve(sandboxDirectory));
}
