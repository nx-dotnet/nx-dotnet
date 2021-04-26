import { readProjectConfiguration, Tree } from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';

import { readFileSync } from 'fs';
import { relative, resolve } from 'path';
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

  it('should run successfully for applications', async () => {
    await GenerateProject(appTree, options, dotnetClient, 'application');
    const config = readProjectConfiguration(appTree, 'test');
    expect(config).toBeDefined();
  });

  /**
   * This test requires a live dotnet client.
   */
  it('should update output paths', async () => {
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
    const expectedDistPath = resolve('./dist/test');

    expect(absoluteDistPath).toEqual(expectedDistPath);
  });
});
