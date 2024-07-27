import { Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';

import { DotNetClient, dotnetFactory } from '@nx-dotnet/dotnet';

import * as mockedProjectGenerator from '../utils/generate-project';
import generator from './generator';
import { NxDotnetGeneratorSchema } from './schema';

jest.mock('../utils/generate-project');

describe('nx-dotnet library generator', () => {
  let tree: Tree;
  let dotnetClient: DotNetClient;

  const options: NxDotnetGeneratorSchema = {
    name: 'test',
    language: 'C#',
    template: 'classlib',
    testTemplate: 'none',
    projectType: 'library',
    skipSwaggerLib: true,
    pathScheme: 'nx',
  };

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
    dotnetClient = new DotNetClient(dotnetFactory());
  });

  it('should run successfully', async () => {
    await generator(tree, options, dotnetClient);
  });

  it('should call project generator with library project type', async () => {
    const projectGenerator = (
      mockedProjectGenerator as jest.Mocked<typeof mockedProjectGenerator>
    ).GenerateProject;

    await generator(tree, options, dotnetClient);
    expect(projectGenerator).toHaveBeenCalledWith(
      tree,
      options,
      dotnetClient,
      'library',
    );
  });
});
