import { readProjectConfiguration, Tree } from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';

import { DotNetClient, mockDotnetFactory } from '@nx-dotnet/dotnet';

import generator from './generator';
import { NxDotnetGeneratorSchema } from './schema';

describe('nx-dotnet app generator', () => {
  let appTree: Tree;
  let dotnetClient: DotNetClient;

  const options: NxDotnetGeneratorSchema = {
    name: 'test',
    language: 'C#',
    template: 'mvc',
    "test-template": 'none',
    skipOutputPathManipulation: true
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
