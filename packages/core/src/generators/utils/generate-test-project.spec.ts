import {
  addProjectConfiguration,
  readProjectConfiguration,
  Tree,
  writeJson,
} from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';

import { mkdirSync } from 'fs';
import * as fs from 'fs';

import { resolve } from 'path';

import { DotNetClient, mockDotnetFactory } from '@nx-dotnet/dotnet';
import { NXDOTNET_TAG } from '@nx-dotnet/utils';

import { GenerateTestProject } from './generate-test-project';
import { NormalizedSchema } from './generate-project';

import * as utils from '@nx-dotnet/utils';

const MOCK_CS_PROJ = `<Project>
<PropertyGroup>
  <TargetFramework>net5.0</TargetFramework>
</PropertyGroup>
</Project>`;

jest.mock('@nx-dotnet/utils', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...(jest.requireActual('@nx-dotnet/utils') as any),
  glob: jest.fn(),
  findProjectFileInPath: jest.fn(),
  resolve: (m: string) => m,
}));

describe('nx-dotnet test project generator', () => {
  let appTree: Tree;
  let dotnetClient: DotNetClient;
  let options: NormalizedSchema;
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
    jest.spyOn(fs, 'readFileSync').mockReturnValue(MOCK_CS_PROJ);
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
    writeJson(appTree, 'package.json', packageJson);

    options = {
      name: 'domain-existing-app',
      template: 'xunit',
      testTemplate: 'xunit',
      language: 'C#',
      skipOutputPathManipulation: true,
      standalone: false,
      projectType: 'application',
      projectRoot: 'apps/domain/existing-app',
      projectName: 'domain-existing-app',
      projectDirectory: 'domain',
      projectLanguage: 'C#',
      parsedTags: [NXDOTNET_TAG],
      projectTemplate: 'xunit',
      className: 'DomainExistingApp',
      namespaceName: 'Domain.ExistingApp',
    };
    testProjectName = options.name + '-test';
  });

  it('should tag nx-dotnet projects', async () => {
    await GenerateTestProject(appTree, options, dotnetClient);
    const config = readProjectConfiguration(appTree, testProjectName);
    expect(config.tags).toContain(NXDOTNET_TAG);
  });

  it('should include test target', async () => {
    await GenerateTestProject(appTree, options, dotnetClient);
    const config = readProjectConfiguration(appTree, testProjectName);
    expect(config.targets?.test).toBeDefined();
  });

  it('should set output paths in build target', async () => {
    await GenerateTestProject(appTree, options, dotnetClient);
    const config = readProjectConfiguration(appTree, testProjectName);
    console.log(config.targets?.build.options);
    const outputPath = config.targets?.build.options.output;
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
    expect(config.targets?.lint).toBeDefined();
  });

  it('should determine directory from existing project', async () => {
    await GenerateTestProject(appTree, options, dotnetClient);
    const config = readProjectConfiguration(appTree, testProjectName);
    expect(config.root).toBe('apps/domain/existing-app-test');
  });

  it('should determine directory from existing project and suffix', async () => {
    options.testProjectNameSuffix = 'integration-tests';
    testProjectName = options.name + '-' + options.testProjectNameSuffix;
    await GenerateTestProject(appTree, options, dotnetClient);
    const config = readProjectConfiguration(appTree, testProjectName);
    expect(config.root).toBe('apps/domain/existing-app-integration-tests');
  });
});
