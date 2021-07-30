import { names } from '@nrwl/devkit';
import {
  checkFilesExist,
  ensureNxProject,
  readFile,
  runNxCommandAsync,
  uniq,
} from '@nrwl/nx-plugin/testing';

import { readFileSync } from 'fs';
import { join } from 'path';
import { XmlDocument } from 'xmldoc';

import { findProjectFileInPathSync } from '@nx-dotnet/utils';

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
        join('tmp/nx-e2e/proj/apps', app),
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
    xit('should add a reference to the target project', async () => {
      const app = uniq('app');
      await runNxCommandAsync(
        `generate @nx-dotnet/core:app ${app} --language="C#" --template="webapi" --test-template="none"`,
      );
      const testProject = `${app}.Test`;
      await runNxCommandAsync(
        `generate @nx-dotnet/core:test ${app} --language="C#" --template="nunit"`,
      );

      const config = readFile(
        join('apps', app, `Proj.${names(testProject).className}.csproj`),
      );
      const projectXml = new XmlDocument(config);
      const projectReference = projectXml
        .childrenNamed('ItemGroup')[1]
        ?.childNamed('ProjectReference');

      expect(projectReference).toBeDefined();
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
});
