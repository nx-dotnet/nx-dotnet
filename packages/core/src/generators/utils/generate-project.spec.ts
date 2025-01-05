import {
  readNxJson,
  readProjectConfiguration,
  Tree,
  updateNxJson,
  writeJson,
} from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';

import {
  DotNetClient,
  dotnetFactory,
  mockDotnetFactory,
} from '@nx-dotnet/dotnet';

import { NxDotnetProjectGeneratorSchema } from '../../models';
import { GenerateProject, getProjectRootFromSchema } from './generate-project';
import * as mockedGenerateTestProject from '../test/generator';

import path = require('path');

// eslint-disable-next-line @typescript-eslint/no-empty-function
// jest.spyOn(console, 'log').mockImplementation(() => {});

jest.mock('@nx/devkit', () => ({
  ...jest.requireActual('@nx/devkit'),
  createProjectGraphAsync: jest.fn((() =>
    Promise.resolve({
      nodes: {},
      externalNodes: {},
      dependencies: {},
    })) as typeof import('@nx/devkit').createProjectGraphAsync),
}));

jest.mock('@nx-dotnet/utils', () => ({
  ...jest.requireActual('@nx-dotnet/utils'),
  resolve: jest.fn(() => 'check-module-boundaries.js'),
}));

jest.mock('../test/generator');

describe('nx-dotnet generate-project', () => {
  let tree: Tree;
  let dotnetClient: DotNetClient;
  let options: NxDotnetProjectGeneratorSchema;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });

    updateNxJson(tree, {
      useInferencePlugins: false,
    });

    dotnetClient = new DotNetClient(dotnetFactory());

    const packageJson = {
      name: '@proj/source',
      scripts: {},
      devDependencies: {},
    };
    writeJson(tree, 'package.json', packageJson);

    options = {
      name: 'test',
      language: 'C#',
      template: 'classlib',
      testTemplate: 'none',
      skipSwaggerLib: true,
      projectType: 'application',
      pathScheme: 'nx',
      __unparsed__: [],
      args: [],
      skipFormat: true,
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
    await GenerateProject(tree, options, dotnetClient, 'library');
    const config = readProjectConfiguration(tree, 'test');
    expect(config).toBeDefined();
  });

  it('should not include serve target for libraries', async () => {
    await GenerateProject(tree, options, dotnetClient, 'library');
    const config = readProjectConfiguration(tree, 'test');
    expect(config.targets?.serve).not.toBeDefined();
  });

  it('should run successfully for applications', async () => {
    await GenerateProject(tree, options, dotnetClient, 'application');
    const config = readProjectConfiguration(tree, 'test');
    expect(config).toBeDefined();
  });

  it('should set outputs for build target', async () => {
    await GenerateProject(tree, options, dotnetClient, 'application');
    const config = readProjectConfiguration(tree, 'test');
    const outputPath = config.targets?.build.outputs || [];

    expect(outputPath[0]).toEqual('{workspaceRoot}/dist/apps/test');
    expect(outputPath[1]).toEqual(
      '{workspaceRoot}/dist/intermediates/apps/test',
    );
  });

  it('should include serve target for applications', async () => {
    await GenerateProject(tree, options, dotnetClient, 'application');
    const config = readProjectConfiguration(tree, 'test');
    expect(config.targets?.serve).toBeDefined();
  });

  it('should generate test project', async () => {
    const generateTestProject = (
      mockedGenerateTestProject as jest.Mocked<typeof mockedGenerateTestProject>
    ).default;

    options.testTemplate = 'nunit';
    await GenerateProject(tree, options, dotnetClient, 'application');
    const config = readProjectConfiguration(tree, 'test');
    expect(config.targets?.serve).toBeDefined();
    expect(generateTestProject).toHaveBeenCalledWith(
      tree,
      expect.objectContaining({
        language: options.language,
        pathScheme: options.pathScheme,
        solutionFile: options.solutionFile,
        suffix: options.testProjectNameSuffix,
        tags: options.tags,
        targetProject: options.name,
        testTemplate: options.testTemplate,
      }),
      dotnetClient,
    );
  });

  it('should include lint target', async () => {
    await GenerateProject(tree, options, dotnetClient, 'application');
    const config = readProjectConfiguration(tree, 'test');
    expect(config.targets?.lint).toBeDefined();
  });

  it('should prepend directory name to project name', async () => {
    options.directory = 'sub-dir';
    const spy = jest.spyOn(dotnetClient, 'new');
    await GenerateProject(tree, options, dotnetClient, 'library');
    const [, dotnetOptions] = spy.mock.calls[spy.mock.calls.length - 1];
    const nameFlag = dotnetOptions?.name;
    expect(nameFlag).toBe('Proj.SubDir.Test');
  });

  it('should forward args to dotnet new', async () => {
    options.__unparsed__ = ['--foo', 'bar'];
    options.args = ['--help'];
    const dotnetClient = new DotNetClient(mockDotnetFactory());
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
    const spy = jest.spyOn(dotnetClient, 'new');
    await GenerateProject(tree, options, dotnetClient, 'library');
    const [, , additionalArguments] = spy.mock.calls[spy.mock.calls.length - 1];
    expect(additionalArguments).toEqual(
      expect.arrayContaining(['--help', '--foo', 'bar']),
    );
    expect(additionalArguments).toHaveLength(3);
  });

  describe('swagger library', () => {
    it('should generate swagger backed project', async () => {
      options.name = 'api';
      options.skipSwaggerLib = false;
      options.template = 'webapi';
      await GenerateProject(tree, options, dotnetClient, 'application');
      expect(readProjectConfiguration(tree, options.name)).toBeDefined();
      expect(
        readProjectConfiguration(tree, `${options.name}-swagger`),
      ).toBeDefined();

      const nxJson = readNxJson(tree);

      expect(nxJson?.targetDefaults?.codegen.cache).toBeTruthy();
      expect(nxJson?.targetDefaults?.swagger.cache).toBeTruthy();
    });
  });

  it('should create .gitignore', async () => {
    await GenerateProject(tree, options, dotnetClient, 'application');
    const config = readProjectConfiguration(tree, options.name);
    const gitignoreValue = tree
      .read(path.join(config.root, '.gitignore'))
      ?.toString();
    expect(gitignoreValue).toBeTruthy();
  });

  describe('getRootFromSchema', () => {
    it('should append workspace layout if not in directory', () => {
      const root = getProjectRootFromSchema(
        tree,
        options,
        'test',
        'application',
      );
      expect(root).toEqual('apps/test');
    });

    it('should not append workspace layout if in directory', () => {
      options.directory = 'sub-dir';
      const root = getProjectRootFromSchema(
        tree,
        options,
        'apps/test',
        'application',
      );
      expect(root).toEqual('apps/test');
    });
  });
});
