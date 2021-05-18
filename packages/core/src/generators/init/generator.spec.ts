import { readJson, Tree } from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import { DotNetClient, mockDotnetFactory } from '@nx-dotnet/dotnet';

import { CONFIG_FILE_PATH, NxDotnetConfig } from '@nx-dotnet/utils';

import generator from './generator';

describe('init generator', () => {
  let appTree: Tree;
  let dotnetClient: DotNetClient;

  beforeEach(() => {
    appTree = createTreeWithEmptyWorkspace();
    dotnetClient = new DotNetClient(mockDotnetFactory());
  });

  it('should create config', async () => {
    await generator(appTree, dotnetClient);
    const config = appTree.isFile(CONFIG_FILE_PATH);
    expect(config).toBeTruthy();
  });

  it('should update gitignore', async () => {
    appTree.write('.gitignore', '');
    await generator(appTree, dotnetClient);
    const gitignoreValue = appTree.read('.gitignore')?.toString();
    expect(gitignoreValue).toBeTruthy();
  });

  it('should put dependency array inside config', async () => {
    await generator(appTree, dotnetClient);
    const config: NxDotnetConfig = readJson(appTree, CONFIG_FILE_PATH);
    expect(config.nugetPackages).toBeDefined();
  });

  it('should create tool manifest', async () => {
    const spy = spyOn(dotnetClient, 'new');
    await generator(appTree, dotnetClient);
    expect(spy).toHaveBeenCalledWith('tool-manifest');
  });

  it('should not create tool manifest if it exists', async () => {
    appTree.write('.config/dotnet-tools.json', '');
    const spy = spyOn(dotnetClient, 'new');
    await generator(appTree, dotnetClient);
    expect(spy).not.toHaveBeenCalled();
  });
});
