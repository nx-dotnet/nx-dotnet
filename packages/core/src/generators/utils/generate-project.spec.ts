import { readProjectConfiguration, Tree, writeJson } from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { XmlDocument } from 'xmldoc';

import {
  DotNetClient,
  dotnetFactory,
  dotnetNewOptions,
  mockDotnetFactory,
} from '@nx-dotnet/dotnet';
import { findProjectFileInPath, NXDOTNET_TAG, rimraf } from '@nx-dotnet/utils';

import { NxDotnetProjectGeneratorSchema } from '../../models';
import { GenerateProject } from './generate-project';

describe('nx-dotnet project generator', () => {
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
      standalone: false,
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
    const spy = jest.spyOn(dotnetClient, 'new');
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
