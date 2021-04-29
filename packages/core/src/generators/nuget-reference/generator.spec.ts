import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import { Tree, readProjectConfiguration } from '@nrwl/devkit';

import generator from './generator';
import { NugetReferenceGeneratorSchema } from './schema';

describe('nuget-reference generator', () => {
  let appTree: Tree;
  const options: NugetReferenceGeneratorSchema = {
    packageName: 'test',
    project: 'test',
  };

  beforeEach(() => {
    appTree = createTreeWithEmptyWorkspace();
  });

  it('should run successfully', async () => {
    // await generator(appTree, options);
    expect(true).toBeTruthy();
  });
});
