import {
  readProjectConfiguration,
  Tree,
  writeJson,
  addProjectConfiguration,
} from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';
import { XmlDocument } from 'xmldoc';

import {
  DotNetClient,
  dotnetFactory,
  dotnetNewOptions,
  mockDotnetFactory,
} from '@nx-dotnet/dotnet';
import { findProjectFileInPath, NXDOTNET_TAG, rimraf } from '@nx-dotnet/utils';

import {
  NxDotnetProjectGeneratorSchema,
  NxDotnetTestGeneratorSchema,
} from '../../models';
import { GenerateProject, GenerateTestProject } from './generate-project';

describe('nx-dotnet project generator', () => {
  describe('GenerateProject', () => {
    let appTree: Tree;
    let dotnetClient: DotNetClient;
    let options: NxDotnetProjectGeneratorSchema;

    beforeEach(() => {
      appTree = createTreeWithEmptyWorkspace();
      dotnetClient = new DotNetClient(mockDotnetFactory());

      const packageJson = { scripts: {} };
      writeJson(appTree, 'package.json', packageJson);

      options = {
        name: 'test',
        language: 'C#',
        template: 'classlib',
        testTemplate: 'none',
        skipOutputPathManipulation: true,
      };
    });

    afterEach(async () => {
      await Promise.all([rimraf('apps'), rimraf('libs'), rimraf('.config')]);
    });

    it('should run successfully for libraries', async () => {
      await GenerateProject(appTree, options, dotnetClient, 'library');
      const config = readProjectConfiguration(appTree, 'test');
      expect(config).toBeDefined();
    });

    it('should tag nx-dotnet projects', async () => {
      await GenerateProject(appTree, options, dotnetClient, 'library');
      const config = readProjectConfiguration(appTree, options.name);
      expect(config.tags).toContain(NXDOTNET_TAG);
    });

    it('should not include serve target for libraries', async () => {
      await GenerateProject(appTree, options, dotnetClient, 'library');
      const config = readProjectConfiguration(appTree, 'test');
      expect(config.targets.serve).not.toBeDefined();
    });

    it('should run successfully for applications', async () => {
      await GenerateProject(appTree, options, dotnetClient, 'application');
      const config = readProjectConfiguration(appTree, 'test');
      expect(config).toBeDefined();
    });

    it('should set output paths in build target', async () => {
      await GenerateProject(appTree, options, dotnetClient, 'application');
      const config = readProjectConfiguration(appTree, 'test');
      const outputPath = config.targets.build.options.output;
      expect(outputPath).toBeTruthy();

      const absoluteDistPath = resolve(appTree.root, outputPath);
      const expectedDistPath = resolve(appTree.root, './dist/apps/test');

      expect(absoluteDistPath).toEqual(expectedDistPath);
    });

    it('should include serve target for applications', async () => {
      await GenerateProject(appTree, options, dotnetClient, 'application');
      const config = readProjectConfiguration(appTree, 'test');
      expect(config.targets.serve).toBeDefined();
    });

    it('should generate test project', async () => {
      options.testTemplate = 'nunit';
      await GenerateProject(appTree, options, dotnetClient, 'application');
      const config = readProjectConfiguration(appTree, 'test');
      expect(config.targets.serve).toBeDefined();
    });

    it('should include lint target', async () => {
      await GenerateProject(appTree, options, dotnetClient, 'application');
      const config = readProjectConfiguration(appTree, 'test');
      expect(config.targets.lint).toBeDefined();
    });

    it('should prepend directory name to project name', async () => {
      options.directory = 'sub-dir';
      const spy = spyOn(dotnetClient, 'new');
      await GenerateProject(appTree, options, dotnetClient, 'library');
      const dotnetOptions: dotnetNewOptions = spy.calls.mostRecent().args[1];
      const nameFlag = dotnetOptions.find((flag) => flag.flag === 'name');
      expect(nameFlag?.value).toBe('Proj.SubDir.Test');
    });

    /**
     * This test requires a live dotnet client.
     */
    it('should update output paths in project file', async () => {
      await GenerateProject(
        appTree,
        {
          ...options,
          skipOutputPathManipulation: false,
        },
        new DotNetClient(dotnetFactory()),
        'library',
      );
      const config = readProjectConfiguration(appTree, 'test');
      const projectFilePath = await findProjectFileInPath(config.root);
      const projectXml = new XmlDocument(
        readFileSync(projectFilePath).toString(),
      );
      const outputPath = projectXml
        .childNamed('PropertyGroup')
        ?.childNamed('OutputPath')?.val as string;
      expect(outputPath).toBeTruthy();

      const absoluteDistPath = resolve(config.root, outputPath);
      const expectedDistPath = resolve('./dist/libs/test');

      expect(absoluteDistPath).toEqual(expectedDistPath);
    });
  });

  describe('GenerateTestProject', () => {
    let appTree: Tree;
    let dotnetClient: DotNetClient;
    let options: NxDotnetTestGeneratorSchema;
    let testProjectName: string;

    beforeEach(() => {
      appTree = createTreeWithEmptyWorkspace();
      addProjectConfiguration(appTree, 'domain-existing-app', {
        root: 'apps/domain/existing-app',
        projectType: 'application',
        targets: {},
      });
      addProjectConfiguration(appTree, 'domain-existing-lib', {
        root: 'libs/domain/existing-lib',
        projectType: 'library',
        targets: {},
      });

      mkdirSync('apps/domain/existing-app', { recursive: true });
      writeFileSync(
        'apps/domain/existing-app/Proj.Domain.ExistingApp.csproj',
        `<Project>
  <PropertyGroup>
    <TargetFramework>net5.0</TargetFramework>
  </PropertyGroup>
</Project>`,
      );

      dotnetClient = new DotNetClient(mockDotnetFactory());

      const packageJson = { scripts: {} };
      writeJson(appTree, 'package.json', packageJson);

      options = {
        project: 'domain-existing-app',
        testTemplate: 'xunit',
        language: 'C#',
        skipOutputPathManipulation: true,
      };
      testProjectName = options.project + '-test';
    });

    afterEach(async () => {
      await Promise.all([rimraf('apps'), rimraf('libs'), rimraf('.config')]);
    });

    it('should detect library type for libraries', async () => {
      options.project = 'domain-existing-lib';
      testProjectName = options.project + '-test';
      await GenerateTestProject(appTree, options, dotnetClient);
      const config = readProjectConfiguration(appTree, testProjectName);
      expect(config.projectType).toBe('library');
    });

    it('should tag nx-dotnet projects', async () => {
      await GenerateTestProject(appTree, options, dotnetClient);
      const config = readProjectConfiguration(appTree, testProjectName);
      expect(config.tags).toContain(NXDOTNET_TAG);
    });

    it('should detect application type for applications', async () => {
      await GenerateTestProject(appTree, options, dotnetClient);
      const config = readProjectConfiguration(appTree, testProjectName);
      expect(config.projectType).toBe('application');
    });

    it('should include test target', async () => {
      await GenerateTestProject(appTree, options, dotnetClient);
      const config = readProjectConfiguration(appTree, testProjectName);
      expect(config.targets.test).toBeDefined();
    });

    it('should set output paths in build target', async () => {
      await GenerateTestProject(appTree, options, dotnetClient);
      const config = readProjectConfiguration(appTree, testProjectName);
      const outputPath = config.targets.build.options.output;
      expect(outputPath).toBeTruthy();

      const absoluteDistPath = resolve(appTree.root, outputPath);
      const expectedDistPath = resolve(
        appTree.root,
        './dist/apps/domain/existing-app-test',
      );

      expect(absoluteDistPath).toEqual(expectedDistPath);
    });

    it('should include lint target', async () => {
      await GenerateTestProject(appTree, options, dotnetClient);
      const config = readProjectConfiguration(appTree, testProjectName);
      expect(config.targets.lint).toBeDefined();
    });

    it('should determine directory from existing project', async () => {
      await GenerateTestProject(appTree, options, dotnetClient);
      const config = readProjectConfiguration(appTree, testProjectName);
      expect(config.root).toBe('apps/domain/existing-app-test');
    });

    it('should prepend directory name to project name', async () => {
      const spy = spyOn(dotnetClient, 'new');
      await GenerateTestProject(appTree, options, dotnetClient);
      const dotnetOptions: dotnetNewOptions = spy.calls.mostRecent().args[1];
      const nameFlag = dotnetOptions.find((flag) => flag.flag === 'name');
      expect(nameFlag?.value).toBe('Proj.Domain.ExistingApp.Test');
    });

    /**
     * This test requires a live dotnet client.
     */
    it('should add a reference to the target project', async () => {
      await GenerateTestProject(
        appTree,
        {
          ...options,
          skipOutputPathManipulation: false,
        },
        new DotNetClient(dotnetFactory()),
      );
      const config = readProjectConfiguration(appTree, testProjectName);
      const projectFilePath = await findProjectFileInPath(config.root);
      const projectXml = new XmlDocument(
        readFileSync(projectFilePath).toString(),
      );
      const projectReference = projectXml
        .childrenNamed('ItemGroup')[1]
        ?.childNamed('ProjectReference');
      expect(projectReference).toBeDefined();
    });

    /**
     * This test requires a live dotnet client.
     */
    it('should update output paths in project file', async () => {
      await GenerateTestProject(
        appTree,
        {
          ...options,
          skipOutputPathManipulation: false,
        },
        new DotNetClient(dotnetFactory()),
      );
      const config = readProjectConfiguration(appTree, testProjectName);
      const projectFilePath = await findProjectFileInPath(config.root);
      const projectXml = new XmlDocument(
        readFileSync(projectFilePath).toString(),
      );
      const outputPath = projectXml
        .childNamed('PropertyGroup')
        ?.childNamed('OutputPath')?.val as string;
      expect(outputPath).toBeTruthy();

      const absoluteDistPath = resolve(config.root, outputPath);
      const expectedDistPath = resolve('./dist/apps/domain/existing-app-test');

      expect(absoluteDistPath).toEqual(expectedDistPath);
    });
  });
});
