import {
  addProjectConfiguration,
  readJson,
  readProjectConfiguration,
  Tree,
  writeJson,
} from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';

import { mkdirSync, writeFileSync } from 'fs';
import { resolve } from 'path';

import { DotNetClient, mockDotnetFactory } from '@nx-dotnet/dotnet';
import { NXDOTNET_TAG } from '@nx-dotnet/utils';

import { GenerateTestProject } from './generate-test-project';
import { NormalizedSchema, normalizeOptions } from './generate-project';

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

    options = normalizeOptions(appTree, {
      name: 'domain-existing-app',
      template: 'xunit',
      testTemplate: 'xunit',
      language: 'C#',
      skipOutputPathManipulation: true,
      standalone: false,
      projectType: 'application',
    });
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
    expect(config.targets.test).toBeDefined();
  });

  xit('should set output paths in build target', async () => {
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

  xit('should determine directory from existing project', async () => {
    await GenerateTestProject(appTree, options, dotnetClient);
    const config = readProjectConfiguration(appTree, testProjectName);
    expect(config.root).toBe('apps/domain/existing-app-test');
  });

  xit('should prepend directory name to project name', async () => {
    const spy = jest.spyOn(dotnetClient, 'new');
    await GenerateTestProject(appTree, options, dotnetClient);
    const [, dotnetOptions] = spy.mock.calls[spy.mock.calls.length - 1];
    const nameFlag = dotnetOptions?.find((flag) => flag.flag === 'name');
    expect(nameFlag?.value).toBe('Proj.Domain.ExistingApp.Test');
  });
});
