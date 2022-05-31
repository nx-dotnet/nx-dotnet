import { Tree } from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';

import { DotNetClient, mockDotnetFactory } from '@nx-dotnet/dotnet';

import * as mockedProjectGenerator from '../utils/generate-project';
import generator from './generator';
import { NxDotnetGeneratorSchema } from './schema';

jest.mock('../utils/generate-project');

describe('nx-dotnet library generator', () => {
  let appTree: Tree;
  let dotnetClient: DotNetClient;

  const options: NxDotnetGeneratorSchema = {
    name: 'test',
    language: 'C#',
    template: 'classlib',
    testTemplate: 'none',
    skipOutputPathManipulation: true,
    standalone: false,
    projectType: 'library',
    skipSwaggerLib: true,
  };

  beforeEach(() => {
    appTree = createTreeWithEmptyWorkspace();
    dotnetClient = new DotNetClient(mockDotnetFactory());
  });

  it('should run successfully', async () => {
    await generator(appTree, options, dotnetClient);
  });

  it('should call project generator with library project type', async () => {
    const projectGenerator = (
      mockedProjectGenerator as jest.Mocked<typeof mockedProjectGenerator>
    ).GenerateProject;

    await generator(appTree, options, dotnetClient);
    expect(projectGenerator).toHaveBeenCalledWith(
      appTree,
      options,
      dotnetClient,
      'library',
    );
  });
});
