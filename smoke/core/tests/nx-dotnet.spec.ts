import { uniq } from '@nx/plugin/testing';

import { exec, ExecOptions } from 'child_process';
import { join } from 'path';

import { readDependenciesFromNxDepGraph } from '@nx-dotnet/utils/e2e';
import { dirSync } from 'tmp';
import { existsSync, mkdirSync } from 'fs';

let smokeDirectory: string;
let cleanup: () => void;

const execAsyncOptions: () => ExecOptions = () => ({
  cwd: join(smokeDirectory, 'test'),
  env: {
    ...process.env,
    GIT_COMMITTER_NAME: 'Smoke Test CI',
    GIT_COMMITTER_EMAIL: 'no-reply@fake.com',
    GIT_AUTHOR_NAME: 'Smoke Test CI',
    GIT_AUTHOR_EMAIL: 'no-reply@fake.com',
    ISTTY: 'false',
  },
});

const testApp = uniq('test-app');
const testLib = uniq('test-lib');

function execAsync(command: string, opts: ExecOptions): Promise<void> {
  opts = { ...execAsyncOptions(), ...opts };
  return new Promise((resolve, reject) => {
    const cp = exec(command, opts, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      }
      resolve();
    });

    cp.stdout?.pipe(process.stdout);
    cp.stderr?.pipe(process.stderr);
  });
}

describe('nx-dotnet smoke', () => {
  beforeAll(
    async () => {
      ({ name: smokeDirectory, removeCallback: cleanup } = dirSync({
        unsafeCleanup: true,
      }));

      await execAsync(
        'npx create-nx-workspace@latest test --preset ts --nxCloud skip',
        {
          cwd: smokeDirectory,
          env: process.env,
        },
      );

      await execAsync('git init', await execAsyncOptions());

      await execAsync(
        'npm i --save-dev @nx-dotnet/core',
        await execAsyncOptions(),
      );
    },
    20 * 60 * 1000,
  ); // 20 minutes

  afterAll(async () => {
    cleanup();
  });

  it('should be able to generate apps, libs, and references', async () => {
    await execAsync(
      `npx nx g @nx-dotnet/core:lib ${testLib} --language C# --template classlib --testTemplate nunit`,
      await execAsyncOptions(),
    );
    await execAsync(
      `npx nx g @nx-dotnet/core:app ${testApp} --language C# --template webapi --testTemplate nunit`,
      await execAsyncOptions(),
    );

    await execAsync(
      `npx nx g @nx-dotnet/core:project-reference ${testApp} ${testLib}`,
      await execAsyncOptions(),
    );

    await execAsync(`npx nx build ${testApp} --graph=stdout`, {
      ...(await execAsyncOptions()),
    });

    const deps = await readDependenciesFromNxDepGraph(
      join(smokeDirectory, 'test'),
      testApp,
    );
    expect(deps).toContain(testLib);

    await execAsync(`npx nx build ${testApp}`, await execAsyncOptions());
  }, 1500000);

  it('should be able infer projects', async () => {
    const projectDirectory = join(smokeDirectory, 'test', 'apps', 'inferred');
    ensureDirSync(projectDirectory);
    await execAsync('dotnet new webapi', { cwd: projectDirectory });
    await execAsync(`npx nx build`, { cwd: projectDirectory });
  }, 1500000);
});

function ensureDirSync(dir: string) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}
