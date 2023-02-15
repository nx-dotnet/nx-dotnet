import { readProjectConfiguration, Tree, writeJson } from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';

import { DotNetClient, mockDotnetFactory } from '@nx-dotnet/dotnet';
import path = require('path');

import { NxDotnetProjectGeneratorSchema } from '../../models';
import { GenerateProject } from './generate-project';
import * as mockedGenerateTestProject from './generate-test-project';

// eslint-disable-next-line @typescript-eslint/no-empty-function
jest.spyOn(console, 'log').mockImplementation(() => {});

jest.mock('@nx-dotnet/utils', () => ({
  ...jest.requireActual('@nx-dotnet/utils'),
  resolve: jest.fn(() => 'check-module-boundaries.js'),
}));

jest.mock('./generate-test-project');

describe('nx-dotnet project generator', () => {
  let appTree: Tree;
  let dotnetClient: DotNetClient;
  let options: NxDotnetProjectGeneratorSchema;

  beforeEach(() => {
    appTree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
    dotnetClient = new DotNetClient(mockDotnetFactory());

    const packageJson = { scripts: {}, devDependencies: {} };
    writeJson(appTree, 'package.json', packageJson);

    options = {
      name: 'test',
      language: 'C#',
      template: 'classlib',
      testTemplate: 'none',
      skipSwaggerLib: true,
      projectType: 'application',
      pathScheme: 'nx',
    };

    jest.spyOn(dotnetClient, 'listInstalledTemplates').mockReturnValue([
      {
        shortNames: ['classlib'],
        templateName: 'Class Library',
        languages: ['C#'],
        tags: [],
      },
      {
        shortNames: ['webapi'],
        templateName: 'Web API',
        languages: ['C#'],
        tags: [],
      },
    ]);
  });

  afterEach(async () => {
    // await Promise.all([rimraf('apps'), rimraf('libs'), rimraf('.config')]);
  });

  it('should run successfully for libraries', async () => {
    await GenerateProject(appTree, options, dotnetClient, 'library');
    const config = readProjectConfiguration(appTree, 'test');
    expect(config).toBeDefined();
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

  it('should set outputs for build target', async () => {
    await GenerateProject(appTree, options, dotnetClient, 'application');
    const config = readProjectConfiguration(appTree, 'test');
    const outputPath = config.targets?.build.outputs || [];

    expect(outputPath[0]).toEqual('{workspaceRoot}/dist/apps/test');
    expect(outputPath[1]).toEqual(
      '{workspaceRoot}/dist/intermediates/apps/test',
    );
  });

  it('should include serve target for applications', async () => {
    await GenerateProject(appTree, options, dotnetClient, 'application');
    const config = readProjectConfiguration(appTree, 'test');
    expect(config.targets?.serve).toBeDefined();
  });

  it('should generate test project', async () => {
    const generateTestProject = (
      mockedGenerateTestProject as jest.Mocked<typeof mockedGenerateTestProject>
    ).GenerateTestProject;

    options.testTemplate = 'nunit';
    await GenerateProject(appTree, options, dotnetClient, 'application');
    const config = readProjectConfiguration(appTree, 'test');
    expect(config.targets?.serve).toBeDefined();
    expect(generateTestProject).toHaveBeenCalledWith(
      appTree,
      expect.objectContaining(options),
      dotnetClient,
    );
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
    const nameFlag = dotnetOptions?.name;
    expect(nameFlag).toBe('Proj.SubDir.Test');
  });

  describe('swagger library', () => {
    it('should generate swagger backed project', async () => {
      options.name = 'api';
      options.skipSwaggerLib = false;
      options.template = 'webapi';
      await GenerateProject(appTree, options, dotnetClient, 'application');
      expect(readProjectConfiguration(appTree, options.name)).toBeDefined();
      expect(
        readProjectConfiguration(appTree, `${options.name}-swagger`),
      ).toBeDefined();
    });
  });

  it('should create .gitignore', async () => {
    await GenerateProject(appTree, options, dotnetClient, 'application');
    const config = readProjectConfiguration(appTree, options.name);
    const gitignoreValue = appTree
      .read(path.join(config.root, '.gitignore'))
      ?.toString();
    expect(gitignoreValue).toBeTruthy();
  });
});
