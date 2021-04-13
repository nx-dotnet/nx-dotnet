import {
  checkFilesExist,
  ensureNxProject,
  runNxCommandAsync,
  uniq,
} from '@nrwl/nx-plugin/testing';

describe('nx-dotnet e2e', () => {
  it('should create apps, libs, and project references', async (done) => {
    const testApp = uniq('app');
    const testLib = uniq('lib');
    ensureNxProject('@nx-dotnet/core', 'dist/packages/core');

    let output = await runNxCommandAsync(
      `generate @nx-dotnet/core:app ${testApp} --language="C#" --template="webapi"`
    );

    output = await runNxCommandAsync(
      `generate @nx-dotnet/core:lib ${testLib} --language="C#" --template="classlib"`
    );

    output = await runNxCommandAsync(
      `generate @nx-dotnet/core:project-reference ${testApp} ${testLib}`
    );

    expect(output.stdout).toMatch('Reference .* added to the project');

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
