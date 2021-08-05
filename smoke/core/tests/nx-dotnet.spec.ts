import { rimraf } from '@nx-dotnet/utils';
import { execSync, ExecSyncOptions } from 'child_process';
import { ensureDirSync, readJson } from 'fs-extra';
import { join } from 'path';

const smokeDirectory = 'tmp/smoke-core';
const execSyncOptions: ExecSyncOptions = {
  cwd: join(smokeDirectory, 'test'),
  env: process.env,
  stdio: 'inherit',
};

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
      'npx nx g @nx-dotnet/core:lib test-lib --language C# --template classlib --testTemplate nunit',
      execSyncOptions,
    );
    execSync(
      'npx nx g @nx-dotnet/core:app test-app --language C# --template webapi --testTemplate nunit',
      execSyncOptions,
    );

    execSync(
      `npx nx g @nx-dotnet/core:project-reference test-app test-lib`,
      execSyncOptions,
    );

    const output = await execSync(
      'npx nx print-affected --target build --base HEAD~1',
      execSyncOptions,
    );

    const depGraphCachePath = join(
      smokeDirectory,
      'test',
      'node_modules/.cache/nx/nxdeps.json',
    );

    const deps = (await readJson(depGraphCachePath)).nodes[
      'test-app'
    ].data.files.find(
      (x: { ext: string; deps: string[] }) => x.ext === '.csproj',
    ).deps;

    expect(deps).toContain('test-lib');

    execSync('npx nx build test-app', execSyncOptions);

    expect(true).toBeTruthy();
  }, 150000);
});
