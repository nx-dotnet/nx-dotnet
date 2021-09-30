import { readProjectConfiguration, Tree, writeJson } from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';

import { resolve } from 'path';

import { DotNetClient, dotnetFactory } from '@nx-dotnet/dotnet';
import { NXDOTNET_TAG } from '@nx-dotnet/utils';

import { NxDotnetProjectGeneratorSchema } from '../../models';
import { GenerateProject } from './generate-project';

jest.spyOn(console, 'log').mockImplementation();

describe('nx-dotnet project generator', () => {
  let appTree: Tree;
  let dotnetClient: DotNetClient;
  let options: NxDotnetProjectGeneratorSchema;

  beforeEach(() => {
    appTree = createTreeWithEmptyWorkspace();
    dotnetClient = new DotNetClient(dotnetFactory());

    const packageJson = { scripts: {} };
    writeJson(appTree, 'package.json', packageJson);

    options = {
      name: 'test',
      language: 'C#',
      template: 'classlib',
      testTemplate: 'none',
      skipOutputPathManipulation: true,
      standalone: false,
      projectType: 'application',
    };
  });

  afterEach(async () => {
    // await Promise.all([rimraf('apps'), rimraf('libs'), rimraf('.config')]);
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
    expect(config.targets?.serve).not.toBeDefined();
  });

  it('should run successfully for applications', async () => {
    await GenerateProject(appTree, options, dotnetClient, 'application');
    const config = readProjectConfiguration(appTree, 'test');
    expect(config).toBeDefined();
  });

  it('should set output paths in build target', async () => {
    await GenerateProject(appTree, options, dotnetClient, 'application');
    const config = readProjectConfiguration(appTree, 'test');
    const outputPath = config.targets?.build.options.output;
    expect(outputPath).toBeTruthy();

    const absoluteDistPath = resolve(appTree.root, outputPath);
    const expectedDistPath = resolve(appTree.root, './dist/apps/test');

    expect(absoluteDistPath).toEqual(expectedDistPath);
  });

  it('should include serve target for applications', async () => {
    await GenerateProject(appTree, options, dotnetClient, 'application');
    const config = readProjectConfiguration(appTree, 'test');
    expect(config.targets?.serve).toBeDefined();
  });

  it('should generate test project', async () => {
    options.testTemplate = 'nunit';
    await GenerateProject(appTree, options, dotnetClient, 'application');
    const config = readProjectConfiguration(appTree, 'test');
    expect(config.targets?.serve).toBeDefined();
  });

  it('should include lint target', async () => {
    await GenerateProject(appTree, options, dotnetClient, 'application');
    const config = readProjectConfiguration(appTree, 'test');
    expect(config.targets?.lint).toBeDefined();
  });

  it('should prepend directory name to project name', async () => {
    options.directory = 'sub-dir';
    const spy = jest.spyOn(dotnetClient, 'new');
    await GenerateProject(appTree, options, dotnetClient, 'library');
    const [, dotnetOptions] = spy.mock.calls[spy.mock.calls.length - 1];
    const nameFlag = dotnetOptions?.find((flag) => flag.flag === 'name');
    expect(nameFlag?.value).toBe('Proj.SubDir.Test');
  });
});
