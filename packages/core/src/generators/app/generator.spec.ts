import { Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';

import { DotNetClient, mockDotnetFactory } from '@nx-dotnet/dotnet';

import * as mockedProjectGenerator from '../utils/generate-project';
import generator from './generator';
import { NxDotnetGeneratorSchema } from './schema';

jest.mock('../utils/generate-project');

describe('nx-dotnet app generator', () => {
  let appTree: Tree;
  let dotnetClient: DotNetClient;

  const options: NxDotnetGeneratorSchema = {
    name: 'test',
    language: 'C#',
    template: 'webapi',
    testTemplate: 'none',
    projectType: 'application',
    skipSwaggerLib: true,
    pathScheme: 'nx',
  };

  beforeEach(() => {
    appTree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
    dotnetClient = new DotNetClient(mockDotnetFactory());
  });

  it('should run successfully', async () => {
    await generator(appTree, options, dotnetClient);
  });

  it('should call project generator with application project type', async () => {
    const projectGenerator = (
      mockedProjectGenerator as jest.Mocked<typeof mockedProjectGenerator>
    ).GenerateProject;

    await generator(appTree, options, dotnetClient);
    expect(projectGenerator).toHaveBeenCalledWith(
      appTree,
      options,
      dotnetClient,
      'application',
    );
  });
});
