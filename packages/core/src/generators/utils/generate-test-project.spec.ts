import {
  addProjectConfiguration,
  readProjectConfiguration,
  Tree,
  writeJson,
} from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';

import * as fs from 'fs';

import { DotNetClient, mockDotnetFactory } from '@nx-dotnet/dotnet';
import * as utils from '@nx-dotnet/utils';

import { initGenerator } from '../init/generator';
import { NormalizedSchema } from './generate-project';
import { GenerateTestProject } from './generate-test-project';

jest.mock('@nx-dotnet/utils', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...(jest.requireActual('@nx-dotnet/utils') as any),
  glob: jest.fn(),
  findProjectFileInPath: jest.fn(),
  resolve: (m: string) => m,
}));

jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  readFileSync: (p: fs.PathOrFileDescriptor, ...args) => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    if (typeof p === 'string' && require('path').extname(p) === '.csproj')
      return `<Project>
      <PropertyGroup>
        <TargetFramework>net5.0</TargetFramework>
      </PropertyGroup>
      </Project>`;
    return jest.requireActual('fs').readFileSync(p, ...args);
  },
}));

describe('nx-dotnet test project generator', () => {
  let tree: Tree;
  let dotnetClient: DotNetClient;
  let options: NormalizedSchema;
  let testProjectName: string;

  beforeEach(async () => {
    tree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
    tree.write('package.json', '{}');
    await initGenerator(tree, null, new DotNetClient(mockDotnetFactory()));
    addProjectConfiguration(tree, 'domain-existing-app', {
      root: 'apps/domain/existing-app',
      projectType: 'application',
      targets: {},
    });
    addProjectConfiguration(tree, 'domain-existing-lib', {
      root: 'libs/domain/existing-lib',
      projectType: 'library',
      targets: {},
    });

    fs.mkdirSync('apps/domain/existing-app', { recursive: true });
    jest
      .spyOn(utils, 'glob')
      .mockResolvedValue([
        'apps/domain/existing-app/Proj.Domain.ExistingApp.csproj',
      ]);
    jest
      .spyOn(utils, 'findProjectFileInPath')
      .mockResolvedValue(
        'apps/domain/existing-app/Proj.Domain.ExistingApp.csproj',
      );

    dotnetClient = new DotNetClient(mockDotnetFactory());

    const packageJson = { scripts: {} };
    writeJson(tree, 'package.json', packageJson);

    options = {
      name: 'domain-existing-app',
      testTemplate: 'xunit',
      language: 'C#',
      projectType: 'application',
      projectRoot: 'apps/domain/existing-app',
      projectName: 'domain-existing-app',
      projectDirectory: 'domain',
      projectLanguage: 'C#',
      parsedTags: [],
      projectTemplate: 'xunit',
      skipSwaggerLib: true,
      className: 'DomainExistingApp',
      namespaceName: 'Domain.ExistingApp',
      nxProjectName: 'domain-existing-app',
      pathScheme: 'nx',
      skipFormat: true,
      args: [],
      __unparsed__: [],
    };
    testProjectName = options.name + '-test';
  });

  it('should include test target', async () => {
    await GenerateTestProject(tree, options, dotnetClient);
    const config = readProjectConfiguration(tree, testProjectName);
    expect(config.targets?.test).toBeDefined();
  });

  it('should set outputs for build target', async () => {
    await GenerateTestProject(tree, options, dotnetClient);
    const config = readProjectConfiguration(tree, testProjectName);
    const outputPath = config.targets?.build.outputs?.[0];
    expect(outputPath).toEqual(
      '{workspaceRoot}/dist/apps/domain/existing-app-test',
    );
  });

  it('should include lint target', async () => {
    await GenerateTestProject(tree, options, dotnetClient);
    const config = readProjectConfiguration(tree, testProjectName);
    expect(config.targets?.lint).toBeDefined();
  });

  it('should determine directory from existing project', async () => {
    await GenerateTestProject(tree, options, dotnetClient);
    const config = readProjectConfiguration(tree, testProjectName);
    expect(config.root).toBe('apps/domain/existing-app-test');
  });

  it('should determine directory from existing project and suffix', async () => {
    options.testProjectNameSuffix = 'integration-tests';
    testProjectName = options.name + '-' + options.testProjectNameSuffix;
    await GenerateTestProject(tree, options, dotnetClient);
    const config = readProjectConfiguration(tree, testProjectName);
    expect(config.root).toBe('apps/domain/existing-app-integration-tests');
  });
});
