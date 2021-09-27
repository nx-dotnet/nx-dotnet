import { uniq } from '@nrwl/nx-plugin/testing';

import { execSync, ExecSyncOptions } from 'child_process';
import { ensureDirSync } from 'fs-extra';
import { join } from 'path';

import { rimraf } from '@nx-dotnet/utils';
import { readDependenciesFromNxDepGraph } from '@nx-dotnet/utils/e2e';

const smokeDirectory = 'tmp/smoke-core';
const execSyncOptions: ExecSyncOptions = {
  cwd: join(smokeDirectory, 'test'),
  env: process.env,
  stdio: 'inherit',
};

const testApp = uniq('test-app');
const testLib = uniq('test-lib');

describe('nx-dotnet smoke', () => {
  beforeEach(async () => {
    await rimraf(smokeDirectory);
    ensureDirSync(smokeDirectory);
  });

  it('should work', async () => {
    execSync('npx create-nx-workspace test --preset empty --nxCloud false', {
      cwd: smokeDirectory,
      env: process.env,
      stdio: 'inherit',
    });
    execSync('npm i --save-dev @nx-dotnet/core', execSyncOptions);
    execSync(
      `npx nx g @nx-dotnet/core:lib ${testLib} --language C# --template classlib --testTemplate nunit`,
      execSyncOptions,
    );
    execSync(
      `npx nx g @nx-dotnet/core:app ${testApp} --language C# --template webapi --testTemplate nunit`,
      execSyncOptions,
    );

    execSync(
      `npx nx g @nx-dotnet/core:project-reference ${testApp} ${testLib}`,
      execSyncOptions,
    );

    await execSync('npx nx print-affected --target build --base HEAD~1', {
      ...execSyncOptions,
      stdio: 'ignore',
    });

    const deps = await readDependenciesFromNxDepGraph(
      join(smokeDirectory, 'test'),
      testApp,
    );
    expect(deps).toContain(testLib);

    execSync(`npx nx build ${testApp}`, execSyncOptions);

    expect(true).toBeTruthy();
  }, 150000);
});
