import {
  joinPathFragments,
  names,
  WorkspaceJsonConfiguration,
} from '@nrwl/devkit';
import {
  checkFilesExist,
  ensureNxProject,
  readFile,
  readJson,
  runNxCommandAsync,
  uniq,
} from '@nrwl/nx-plugin/testing';

import { readFileSync } from 'fs';
import { join } from 'path';
import { XmlDocument } from 'xmldoc';

import { findProjectFileInPathSync } from '@nx-dotnet/utils';
import { readDependenciesFromNxCache } from '@nx-dotnet/utils/e2e';
import { execSync } from 'child_process';
import { ensureDirSync } from 'fs-extra';

const e2eDir = 'tmp/nx-e2e/proj';

describe('nx-dotnet e2e', () => {
  it('should create apps, libs, and project references', async () => {
    const testApp = uniq('app');
    const testLib = uniq('lib');
    ensureNxProject('@nx-dotnet/core', 'dist/packages/core');

    await runNxCommandAsync(
      `generate @nx-dotnet/core:app ${testApp} --language="C#" --template="webapi"`,
    );

    await runNxCommandAsync(
      `generate @nx-dotnet/core:lib ${testLib} --language="C#" --template="classlib"`,
    );

    const output = await runNxCommandAsync(
      `generate @nx-dotnet/core:project-reference ${testApp} ${testLib}`,
    );

    expect(output.stdout).toMatch(/Reference .* added to the project/);
  });

  it('should work with affected', async () => {
    const testApp = uniq('app');
    const testLib = uniq('lib');
    ensureNxProject('@nx-dotnet/core', 'dist/packages/core');

    await runNxCommandAsync(
      `generate @nx-dotnet/core:app ${testApp} --language="C#" --template="webapi"`,
    );

    await runNxCommandAsync(
      `generate @nx-dotnet/core:lib ${testLib} --language="C#" --template="classlib"`,
    );

    await runNxCommandAsync(
      `generate @nx-dotnet/core:project-reference ${testApp} ${testLib}`,
    );

    const output = await runNxCommandAsync(
      'print-affected --target build --base HEAD~1',
    );

    const deps = await readDependenciesFromNxCache(
      join(__dirname, '../../../', e2eDir),
      testApp,
    );

    expect(output.stderr).toBeFalsy();
    expect(deps).toContain(testLib);
  }, 150000);

  describe('nx g app', () => {
    it('should obey dry-run', async () => {
      const app = uniq('app');
      await runNxCommandAsync(
        `generate @nx-dotnet/core:app ${app} --language="C#" --template="webapi" --dry-run`,
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
        `generate @nx-dotnet/core:app ${app} --language="C#" --template="webapi"`,
      );

      let exists = true;
      try {
        checkFilesExist(`apps/${app}`);
      } catch (ex) {
        exists = false;
      }

      expect(exists).toBeTruthy();
    });

    it('should update output paths', async () => {
      const app = uniq('app');
      await runNxCommandAsync(
        `generate @nx-dotnet/core:app ${app} --language="C#" --template="webapi"`,
      );
      const configFilePath = findProjectFileInPathSync(
        join(e2eDir, 'apps', app),
      );
      const config = readFileSync(configFilePath).toString();
      const projectXml = new XmlDocument(config);
      const outputPath = projectXml
        .childNamed('PropertyGroup')
        ?.childNamed('OutputPath')?.val as string;
      expect(outputPath).toBeTruthy();
    });
  });

  describe('nx g test', () => {
    it('should add a reference to the target project', async () => {
      const app = uniq('app');
      await runNxCommandAsync(
        `generate @nx-dotnet/core:app ${app} --language="C#" --template="webapi" --test-template="none"`,
      );
      await runNxCommandAsync(
        `generate @nx-dotnet/core:test ${app} --language="C#" --template="nunit"`,
      );

      const config = readFile(
        joinPathFragments(
          'apps',
          `${app}-test`,
          `Proj.${names(app).className}.Test.csproj`,
        ),
      );
      const projectXml = new XmlDocument(config);
      const projectReference = projectXml
        .childrenNamed('ItemGroup')[1]
        ?.childNamed('ProjectReference');

      expect(projectReference).toBeDefined();
    });

    it('should create test project using suffix', async () => {
      const app = uniq('app');
      await runNxCommandAsync(
        `generate @nx-dotnet/core:app ${app} --language="C#" --template="webapi" --test-template="none"`,
      );
      await runNxCommandAsync(
        `generate @nx-dotnet/core:test ${app} --language="C#" --template="nunit" --suffix="integration-tests"`,
      );

      const config = readFile(
        joinPathFragments(
          'apps',
          `${app}-integration-tests`,
          `Proj.${names(app).className}.IntegrationTests.csproj`,
        ),
      );

      expect(config).toBeDefined();
    });
  });

  describe('nx g lib', () => {
    it('should obey dry-run', async () => {
      const lib = uniq('lib');
      await runNxCommandAsync(
        `generate @nx-dotnet/core:lib ${lib} --language="C#" --template="webapi" --dry-run`,
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
        `generate @nx-dotnet/core:lib ${lib} --language="C#" --template="webapi"`,
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

  describe('nx g import-projects', () => {
    it('should import apps, libs, and test', async () => {
      const testApp = uniq('app');
      const testLib = uniq('lib');
      const testAppTest = `${testApp}-test`;
      ensureNxProject('@nx-dotnet/core', 'dist/packages/core');
      const appDir = `${e2eDir}/apps/${testApp}`;
      const testAppDir = `${e2eDir}/apps/${testAppTest}`;
      const libDir = `${e2eDir}/libs/${testLib}`;
      ensureDirSync(appDir);
      ensureDirSync(libDir);
      ensureDirSync(testAppDir);
      execSync('dotnet new webapi', { cwd: appDir });
      execSync('dotnet new classlib', { cwd: libDir });
      execSync('dotnet new nunit', { cwd: testAppDir });

      await runNxCommandAsync(`generate @nx-dotnet/core:import-projects`);

      const workspace = readJson<WorkspaceJsonConfiguration>('workspace.json');

      console.log('workspace', workspace);

      expect(workspace.projects[testApp].targets.serve).toBeDefined();
      expect(workspace.projects[testApp].targets.build).toBeDefined();
      expect(workspace.projects[testApp].targets.lint).toBeDefined();
      expect(workspace.projects[testLib].targets.serve).not.toBeDefined();
      expect(workspace.projects[testLib].targets.build).toBeDefined();
      expect(workspace.projects[testLib].targets.lint).toBeDefined();
      expect(workspace.projects[testAppTest].targets.build).toBeDefined();
      expect(workspace.projects[testAppTest].targets.lint).toBeDefined();
      expect(workspace.projects[testAppTest].targets.test).toBeDefined();

      await runNxCommandAsync(`build ${testApp}`);
      checkFilesExist(`dist/apps/${testApp}`);
    });
  });
});
