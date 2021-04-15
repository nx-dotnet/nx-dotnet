import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import { Tree, readProjectConfiguration } from '@nrwl/devkit';

import generator from './generator';
import { NxDotnetGeneratorSchema } from './schema';
import { rimraf } from '@nx-dotnet/utils';

describe('nx-dotnet library generator', () => {
  let appTree: Tree;
  const options: NxDotnetGeneratorSchema = {
    name: 'test',
    language: 'C#',
    template: 'classlib',
  };

  beforeEach(() => {
    appTree = createTreeWithEmptyWorkspace();
  });

  afterEach(async () => {
    await rimraf('libs/test');
  });

  it('should run successfully', async () => {
    await generator(appTree, options);
    const config = readProjectConfiguration(appTree, 'test');
    expect(config).toBeDefined();
  });
});
