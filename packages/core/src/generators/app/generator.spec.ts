import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import { Tree, readProjectConfiguration } from '@nrwl/devkit';

import generator from './generator';
import { NxDotnetGeneratorSchema } from './schema';
import * as rimraf from 'rimraf';

describe('nx-dotnet generator', () => {
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
    await new Promise<void>((resolve, reject) => rimraf('apps/test', () => {resolve()}))
  })

  it('should run successfully', async () => {
    await generator(appTree, options);
    const config = readProjectConfiguration(appTree, 'test');
    expect(config).toBeDefined();
  });
});
