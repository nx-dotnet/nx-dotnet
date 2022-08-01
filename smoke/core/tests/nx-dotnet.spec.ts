import { uniq } from '@nrwl/nx-plugin/testing';

import { execSync, ExecSyncOptions } from 'child_process';
import { join } from 'path';

import { readDependenciesFromNxDepGraph } from '@nx-dotnet/utils/e2e';
import { dirSync } from 'tmp';

let smokeDirectory: string;
let cleanup: () => void;

const execSyncOptions: () => ExecSyncOptions = () => ({
  cwd: join(smokeDirectory, 'test'),
  env: {
    ...process.env,
    GIT_COMMITTER_NAME: 'Smoke Test CI',
    GIT_COMMITTER_EMAIL: 'no-reply@fake.com',
    GIT_AUTHOR_NAME: 'Smoke Test CI',
    GIT_AUTHOR_EMAIL: 'no-reply@fake.com',
  },
  stdio: 'inherit',
});

const testApp = uniq('test-app');
const testLib = uniq('test-lib');

describe('nx-dotnet smoke', () => {
  beforeEach(async () => {
    ({ name: smokeDirectory, removeCallback: cleanup } = dirSync({
      unsafeCleanup: true,
    }));
  });

  afterEach(async () => {
    cleanup();
  });

  it('should work', async () => {
    execSync(
      'npx create-nx-workspace@latest test --preset ts --nxCloud false',
      {
        cwd: smokeDirectory,
        env: process.env,
        stdio: 'inherit',
      },
    );

    execSync('git init', execSyncOptions());

    execSync('npm i --save-dev @nx-dotnet/core', execSyncOptions());
    execSync(
      `npx nx g @nx-dotnet/core:lib ${testLib} --language C# --template classlib --testTemplate nunit`,
      execSyncOptions(),
    );
    execSync(
      `npx nx g @nx-dotnet/core:app ${testApp} --language C# --template webapi --testTemplate nunit`,
      execSyncOptions(),
    );

    execSync(
      `npx nx g @nx-dotnet/core:project-reference ${testApp} ${testLib}`,
      execSyncOptions(),
    );

    execSync(`git commit -am "chore: scaffold projects"`, execSyncOptions());

    execSync('npx nx print-affected --target build', {
      ...execSyncOptions(),
      stdio: ['ignore', 'ignore', 'inherit'],
    });

    const deps = await readDependenciesFromNxDepGraph(
      join(smokeDirectory, 'test'),
      testApp,
    );
    expect(deps).toContain(testLib);

    execSync(`npx nx build ${testApp}`, execSyncOptions());

    expect(true).toBeTruthy();
  }, 1500000);
});
