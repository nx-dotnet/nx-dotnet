import {
  checkFilesExist,
  ensureNxProject,
  readJson,
  runNxCommandAsync,
  uniq,
} from '@nrwl/nx-plugin/testing';

import { promises as fs, Stats } from 'fs';

describe('nx-dotnet e2e', () => {
  it('should create apps, libs, and project references', async (done) => {
    const testApp = uniq('app');
    const testLib = uniq('lib');
    ensureNxProject('@nx-dotnet/core', 'dist/packages/core');
    await runNxCommandAsync(
      `generate @nx-dotnet/core:app ${testApp} --language="C#" --template="webapi"`
    );
    await runNxCommandAsync(
      `generate @nx-dotnet/core:lib ${testLib} --language="C#" --template="classlib"`
    );

    const output = await runNxCommandAsync(
      `generate @nx-dotnet/core:project-reference ${testApp} ${testLib}`
    );

    // const result = await runNxCommandAsync(`build ${plugin}`);
    // expect(result.stdout).toContain('Executor ran');

    done();
  });

  describe('nx g app', () => {
    it('should obey dry-run', async () => {
      const app = uniq('app');
      await runNxCommandAsync(
        `generate @nx-dotnet/core:app ${app} --language="C#" --template="webapi" --dry-run`
      );

      let exists = true;
      try {
        checkFilesExist(`apps/${app}`);
      } catch (ex) {
        exists = false;
      }

      expect(exists).toBeFalsy();
    });

    it('should generate an app', async () => {
      const app = uniq('app');
      await runNxCommandAsync(
        `generate @nx-dotnet/core:app ${app} --language="C#" --template="webapi"`
      );

      let stats: Stats = null;

      let exists = true;
      try {
        checkFilesExist(`apps/${app}`);
      } catch (ex) {
        exists = false;
      }

      expect(exists).toBeTruthy();
    });
  });

  describe('nx g lib', () => {
    it('should obey dry-run', async () => {
      const lib = uniq('lib');
      await runNxCommandAsync(
        `generate @nx-dotnet/core:lib ${lib} --language="C#" --template="webapi" --dry-run`
      );

      let exists = true;
      try {
        checkFilesExist(`libs/${lib}`);
      } catch (ex) {
        exists = false;
      }

      expect(exists).toBeFalsy();
    });

    it('should generate an lib', async () => {
      const lib = uniq('lib');
      await runNxCommandAsync(
        `generate @nx-dotnet/core:lib ${lib} --language="C#" --template="webapi"`
      );

      let stats: Stats = null;

      let exists = true;
      try {
        checkFilesExist(`libs/${lib}`);
      } catch (ex) {
        exists = false;
      }

      expect(exists).toBeTruthy();
    });
  });
});
