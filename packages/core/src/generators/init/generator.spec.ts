import { Tree } from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';

import generator from './generator';

describe('init generator', () => {
  let appTree: Tree;

  beforeEach(() => {
    appTree = createTreeWithEmptyWorkspace();
  });

  it('should run successfully', async () => {
    await generator(appTree);
    const config = appTree.isFile('nx-dotnet.config.js');
    expect(config).toBeTruthy();
  });

  it('should update gitignore', async () => {
    appTree.write('.gitignore', '');
    await generator(appTree);
    const gitignoreValue = appTree.read('.gitignore')?.toString();
    expect(gitignoreValue).toBeTruthy();
  });
});
