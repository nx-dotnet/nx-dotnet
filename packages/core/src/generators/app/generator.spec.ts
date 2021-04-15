import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import { Tree, readProjectConfiguration } from '@nrwl/devkit';

import generator from './generator';
import { NxDotnetGeneratorSchema } from './schema';
import { DotNetClient, mockDotnetFactory } from '@nx-dotnet/dotnet';

describe('nx-dotnet app generator', () => {
  let appTree: Tree;
  let dotnetClient: DotNetClient;

  const options: NxDotnetGeneratorSchema = {
    name: 'test',
    language: 'C#',
    template: 'mvc',
  };

  beforeEach(() => {
    appTree = createTreeWithEmptyWorkspace();
    dotnetClient = new DotNetClient(mockDotnetFactory())
  });

  it('should run successfully', async () => {
    await generator(appTree, options, dotnetClient);
    const config = readProjectConfiguration(appTree, 'test');
    expect(config).toBeDefined();
  });
});
