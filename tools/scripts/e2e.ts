import { execSync } from 'child_process';
import { copySync, removeSync } from 'fs-extra';

import { tmpProjPath } from '@nx/plugin/testing';
import { startCleanVerdaccioInstance } from './local-registry/setup';
import { publishAll } from './publish-all';

const kill = require('tree-kill');

export async function setup() {
  process.env.NX_DOTNET_E2E = 'true';
  await startCleanVerdaccioInstance();
  copySync('.npmrc.local', '.npmrc');
  await publishAll('99.99.99', 'local');
}

async function runTest() {
  let selectedProjects = process.argv[2];

  let testNamePattern = '';
  if (process.argv[3] === '-t' || process.argv[3] === '--testNamePattern') {
    testNamePattern = `-t '${process.argv[4]}'`;
  }

  if (process.argv[3] === 'affected') {
    const affected = JSON.parse(
      execSync(`npx nx show projects --affected --json`, {
        env: {
          ...process.env,
          NX_DAEMON: 'false',
        },
      }).toString(),
    );
    selectedProjects =
      affected.length === 0
        ? selectedProjects
        : selectedProjects
            .split(',')
            .filter((s) => affected.indexOf(s) > -1)
            .join(',');
  }

  if (process.argv[5] != '--rerun') {
    removeSync('./dist');
    removeSync(tmpProjPath());
  }

  try {
    await setup();
    if (selectedProjects === '') {
      console.log('No tests to run');
    } else if (selectedProjects) {
      execSync(
        selectedProjects.split(',').length > 1
          ? `yarn nx run-many --target=e2e --projects=${selectedProjects} ${testNamePattern} --output-style=stream`
          : `yarn nx run ${selectedProjects}:e2e ${testNamePattern} --output-style=stream`,
        {
          stdio: [0, 1, 2],
          env: {
            ...process.env,
            NX_CLOUD_DISTRIBUTED_EXECUTION: 'false',
            NX_TERMINAL_CAPTURE_STDERR: 'true',
            NX_DAEMON: 'false',
            NX_PREFER_TS_NODE: 'true',
            NX_VERBOSE_LOGGING: 'true',
            NPM_CONFIG_REGISTRY: 'http://localhost:4872',
            YARN_REGISTRY: 'http://localhost:4872',
          },
        },
      );
    } else {
      execSync(`yarn nx run-many --target=e2e --all --output-style=stream`, {
        stdio: [0, 1, 2],
        env: {
          ...process.env,
          NX_CLOUD_DISTRIBUTED_EXECUTION: 'false',
          NX_TERMINAL_CAPTURE_STDERR: 'true',
          NPM_CONFIG_REGISTRY: 'http://localhost:4872',
          YARN_REGISTRY: 'http://localhost:4872',
        },
      });
    }
    cleanUp(0);
  } catch (e) {
    console.log(e);
    cleanUp(1);
  }
}

function cleanUp(code: number) {
  // try terminate everything first
  try {
    if (!process.env.CI) {
      kill(0);
    }
  } catch (e) {}
  // try killing everything after in case something hasn't terminated
  try {
    if (!process.env.CI) {
      kill(0, 'SIGKILL');
    }
  } catch (e) {}

  process.exit(code);
}

process.on('SIGINT', () => cleanUp(1));

runTest()
  .then(() => {
    console.log('done');
    process.exit(0);
  })
  .catch((e) => {
    console.error('error', e);
    process.exit(1);
  });
