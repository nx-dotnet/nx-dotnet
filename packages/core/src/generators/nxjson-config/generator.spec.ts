import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree, readProjectConfiguration } from '@nx/devkit';

import { moveConfigToNxJson } from './generator';
import { NxjsonConfigGeneratorSchema } from './schema';

describe('nxjson-config generator', () => {
  let tree: Tree;
  const options: NxjsonConfigGeneratorSchema = { name: 'test' };

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('should run successfully', async () => {
    await moveConfigToNxJson(tree, options);
    const config = readProjectConfiguration(tree, 'test');
    expect(config).toBeDefined();
  });
});
