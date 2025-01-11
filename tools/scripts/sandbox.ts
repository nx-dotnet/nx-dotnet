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
import { readFileSync, writeFileSync } from 'fs';
import { NxJsonConfiguration } from '@nx/devkit';

const sandboxDirectory = join(__dirname, '../../tmp/sandbox');

export async function setup() {
  copySync('.npmrc.local', '.npmrc');
  try {
    await startCleanVerdaccioInstance();
  } catch (E) {
    throw E;

    // Its ok.
  }
  // We have to remove the git release configuration from nx.json in order to
  // use the programmatic release API. Real releases of nx-dotnet use the top
  // level `nx release` command which requires that `git` is set at the top level.
  const restoreNxJson = temporarilyPatchJsonFile<NxJsonConfiguration>(
    'nx.json',
    (json) => {
      delete json.release?.['git'];
      return json;
    },
  );
  await releaseVersion({
    specifier: '99.99.99',
    firstRelease: true,
    generatorOptionsOverrides: {
      currentVersionResolver: 'disk',
    },
  });
  await releasePublish({ registry: 'http://localhost:4872' });
  restoreNxJson();
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

function temporarilyPatchJsonFile<T>(path: string, patch: (content: T) => T) {
  const content = readFileSync(path, 'utf-8');
  const json = JSON.parse(content);
  const patched = patch(json);
  writeFileSync(path, JSON.stringify(patched, null, 2));
  return () => writeFileSync(path, content);
}
