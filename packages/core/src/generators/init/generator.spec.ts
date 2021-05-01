import { readJson, Tree } from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';

import { CONFIG_FILE_PATH, NxDotnetConfig } from '@nx-dotnet/utils';

import generator from './generator';

describe('init generator', () => {
  let appTree: Tree;

  beforeEach(() => {
    appTree = createTreeWithEmptyWorkspace();
  });

  it('should create config', async () => {
    await generator(appTree);
    const config = appTree.isFile(CONFIG_FILE_PATH);
    expect(config).toBeTruthy();
  });

  it('should update gitignore', async () => {
    appTree.write('.gitignore', '');
    await generator(appTree);
    const gitignoreValue = appTree.read('.gitignore')?.toString();
    expect(gitignoreValue).toBeTruthy();
  });

  it('should put dependency array inside config', async () => {
    await generator(appTree);
    const config: NxDotnetConfig = readJson(appTree, CONFIG_FILE_PATH);
    expect(config.nugetPackages).toBeDefined();
  });
});
