import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import { Tree, readProjectConfiguration } from '@nrwl/devkit';

import generator from './generator';
import { NxDotnetGeneratorSchema } from './schema';
import { rimraf } from '@nx-dotnet/utils';
import { promises as fs } from 'fs';

describe('nx-dotnet app generator', () => {
  let appTree: Tree;
  const options: NxDotnetGeneratorSchema = {
    name: 'test',
    language: 'C#',
    template: 'mvc',
  };

  beforeEach(() => {
    appTree = createTreeWithEmptyWorkspace();
  });

  afterEach(async () => {
    await rimraf('apps/test');
  });

  it('should run successfully', async () => {
    await generator(appTree, options);
    const config = readProjectConfiguration(appTree, 'test');
    expect(config).toBeDefined();
    const directoryCreated = await (
      await fs.stat(config.sourceRoot)
    ).isDirectory();
    expect(directoryCreated).toBeTruthy();
  });
});
