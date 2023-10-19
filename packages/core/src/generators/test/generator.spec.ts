import { addProjectConfiguration, Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';

import { DotNetClient, mockDotnetFactory } from '@nx-dotnet/dotnet';

import * as mockedProjectGenerator from '../utils/generate-test-project';
import generator from './generator';
import { NxDotnetGeneratorSchema } from './schema';

jest.mock('../utils/generate-test-project');

describe('nx-dotnet test generator', () => {
  let tree: Tree;
  let dotnetClient: DotNetClient;

  const options: NxDotnetGeneratorSchema = {
    name: 'existing',
    testTemplate: 'xunit',
    language: 'C#',
    pathScheme: 'nx',
  };

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
    addProjectConfiguration(tree, 'existing', {
      root: 'apps/existing',
      targets: {},
      projectType: 'application',
    });
    dotnetClient = new DotNetClient(mockDotnetFactory());
  });

  it('should run successfully', async () => {
    await generator(tree, options, dotnetClient);
  });

  it('should call project generator with application project type', async () => {
    const projectGenerator = (
      mockedProjectGenerator as jest.Mocked<typeof mockedProjectGenerator>
    ).GenerateTestProject;

    await generator(tree, options, dotnetClient);
    expect(projectGenerator).toHaveBeenCalled();
    expect(projectGenerator.mock.calls[0][1].projectType).toEqual(
      'application',
    );
  });
});
