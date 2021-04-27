import { readProjectConfiguration, Tree } from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { XmlDocument } from 'xmldoc';

import {
  DotNetClient,
  dotnetFactory,
  mockDotnetFactory,
} from '@nx-dotnet/dotnet';
import { findProjectFileInPath, rimraf } from '@nx-dotnet/utils';

import { NxDotnetProjectGeneratorSchema } from '../../models';
import { GenerateProject } from './generate-project';

describe('nx-dotnet project generator', () => {
  let appTree: Tree;
  let dotnetClient: DotNetClient;

  const options: NxDotnetProjectGeneratorSchema = {
    name: 'test',
    language: 'C#',
    template: 'classlib',
    'test-template': 'none',
    skipOutputPathManipulation: true,
  };

  beforeEach(() => {
    appTree = createTreeWithEmptyWorkspace();
    dotnetClient = new DotNetClient(mockDotnetFactory());
  });

  afterEach(async () => {
    await Promise.all([rimraf('apps'), rimraf('libs')]);
  });

  it('should run successfully for libraries', async () => {
    await GenerateProject(appTree, options, dotnetClient, 'library');
    const config = readProjectConfiguration(appTree, 'test');
    expect(config).toBeDefined();
  });

  it('should not include serve target for libraries', async () => {
    await GenerateProject(appTree, options, dotnetClient, 'library');
    const config = readProjectConfiguration(appTree, 'test');
    expect(config.targets.serve).not.toBeDefined();
  })

  it('should tag generated projects', async () => {
    await GenerateProject(appTree, options, dotnetClient, 'library');
    const config = readProjectConfiguration(appTree, 'test');
    expect(config.tags).toContain('nx-dotnet');
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
  })

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
      'library'
    );
    const config = readProjectConfiguration(appTree, 'test');
    const projectFilePath = await findProjectFileInPath(config.root);
    const projectXml = new XmlDocument(
      readFileSync(projectFilePath).toString()
    );
    const outputPath = projectXml
      .childNamed('PropertyGroup')
      ?.childNamed('OutputPath')?.val as string;
    expect(outputPath).toBeTruthy();

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const absoluteDistPath = resolve(config.root, outputPath);
    const expectedDistPath = resolve('./dist/libs/test');

    expect(absoluteDistPath).toEqual(expectedDistPath);
  });
});
