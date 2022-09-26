import * as devkit from '@nrwl/devkit';
import { readJson, Tree, writeJson } from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';

import { DotNetClient, mockDotnetFactory } from '@nx-dotnet/dotnet';
import { CONFIG_FILE_PATH, NxDotnetConfig } from '@nx-dotnet/utils';

import generator from './generator';

jest.mock('@nx-dotnet/utils', () => ({
  ...jest.requireActual('@nx-dotnet/utils'),
  resolve: jest.fn(() => 'check-module-boundaries.js'),
}));

describe('init generator', () => {
  let appTree: Tree;
  let dotnetClient: DotNetClient;

  beforeEach(() => {
    appTree = createTreeWithEmptyWorkspace();
    dotnetClient = new DotNetClient(mockDotnetFactory());

    const packageJson = { scripts: {} };
    writeJson(appTree, 'package.json', packageJson);
  });

  it('should create config', async () => {
    await generator(appTree, null, dotnetClient);
    const config = appTree.isFile(CONFIG_FILE_PATH);
    expect(config).toBeTruthy();
  });

  it('should update gitignore', async () => {
    appTree.write('.gitignore', '');
    await generator(appTree, null, dotnetClient);
    const gitignoreValue = appTree.read('.gitignore')?.toString();
    expect(gitignoreValue).toBeTruthy();
  });

  it('should put dependency array inside config', async () => {
    await generator(appTree, null, dotnetClient);
    const config: NxDotnetConfig = readJson(appTree, CONFIG_FILE_PATH);
    expect(config.nugetPackages).toBeDefined();
  });

  it('should create tool manifest', async () => {
    const spy = jest.spyOn(dotnetClient, 'new');
    await generator(appTree, null, dotnetClient);
    expect(spy).toHaveBeenCalledWith('tool-manifest');
  });

  it('should not create tool manifest if it exists', async () => {
    appTree.write('.config/dotnet-tools.json', '');
    const spy = jest.spyOn(dotnetClient, 'new');
    await generator(appTree, null, dotnetClient);
    expect(spy).not.toHaveBeenCalled();
  });

  it('should add restore to prepare script', async () => {
    await generator(appTree, null, dotnetClient);
    const updated = readJson(appTree, 'package.json');
    expect(updated.scripts.prepare).toBe('nx g @nx-dotnet/core:restore');
  });

  it('should not add restore if it already exists', async () => {
    const packageJson = {
      scripts: { prepare: 'nx g @nx-dotnet/core:restore' },
    };
    writeJson(appTree, 'package.json', packageJson);
    await generator(appTree, null, dotnetClient);
    const updated = readJson(appTree, 'package.json');
    expect(updated.scripts.prepare).toBe('nx g @nx-dotnet/core:restore');
  });

  it('should add restore to existing prepare steps', async () => {
    const packageJson = {
      scripts: { prepare: 'npm run clean && npm run build' },
    };
    writeJson(appTree, 'package.json', packageJson);
    await generator(appTree, null, dotnetClient);
    const updated = readJson(appTree, 'package.json');
    expect(updated.scripts.prepare).toBe(
      'npm run clean && npm run build && nx g @nx-dotnet/core:restore',
    );
  });

  it('should add directory build props and targets files', async () => {
    await generator(appTree, null, dotnetClient);
    const hasPropsFile = appTree.isFile('Directory.Build.props');
    expect(hasPropsFile).toBeTruthy();

    const hasTargetsFile = appTree.isFile('Directory.Build.targets');
    expect(hasTargetsFile).toBeTruthy();
    const hasPreBuildTask = appTree
      .read('Directory.Build.targets', 'utf-8')
      ?.includes('check-module-boundaries.js');
    expect(hasPreBuildTask).toBeTruthy();
  });

  it('should not add directory build props and targets files if props file exists', async () => {
    appTree.write('Directory.Build.props', '');
    const spy = jest.spyOn(devkit, 'generateFiles');
    await generator(appTree, null, dotnetClient);

    expect(spy).not.toHaveBeenCalled();
    const hasTargetsFile = appTree.isFile('Directory.Build.targets');
    expect(hasTargetsFile).toBeFalsy();
  });
});
