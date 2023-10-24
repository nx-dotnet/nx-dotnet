import * as devkit from '@nx/devkit';
import { readJson, readNxJson, Tree, writeJson } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';

import { DotNetClient, mockDotnetFactory } from '@nx-dotnet/dotnet';

import generator from './generator';

jest.mock('@nx-dotnet/utils', () => ({
  ...jest.requireActual('@nx-dotnet/utils'),
  resolve: jest.fn(() => 'check-module-boundaries.js'),
}));

describe('init generator', () => {
  let tree: Tree;
  let dotnetClient: DotNetClient;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
    dotnetClient = new DotNetClient(mockDotnetFactory());

    const packageJson = { scripts: {} };
    writeJson(tree, 'package.json', packageJson);
  });

  it('should add @nx-dotnet/core to plugins array', async () => {
    writeJson(tree, 'nx.json', {});
    await generator(tree, null, dotnetClient);
    expect(readNxJson(tree)?.plugins).toMatchInlineSnapshot(`
      [
        "@nx-dotnet/core",
      ]
    `);
  });

  it('should add duplicate @nx-dotnet/core entries to plugins array', async () => {
    writeJson(tree, 'nx.json', { plugins: ['@nx-dotnet/core'] });
    await generator(tree, null, dotnetClient);
    expect(readNxJson(tree)?.plugins).toMatchInlineSnapshot(`
      [
        "@nx-dotnet/core",
      ]
    `);
  });

  it('should add duplicate @nx-dotnet/core entries to plugins array (object)', async () => {
    writeJson(tree, 'nx.json', {
      plugins: [
        {
          plugin: '@nx-dotnet/core',
        },
      ],
    });
    await generator(tree, null, dotnetClient);
    expect(readNxJson(tree)?.plugins).toMatchInlineSnapshot(`
      [
        {
          "plugin": "@nx-dotnet/core",
        },
      ]
    `);
  });

  it('should create tool manifest', async () => {
    const spy = jest.spyOn(dotnetClient, 'new');
    await generator(tree, null, dotnetClient);
    expect(spy).toHaveBeenCalledWith('tool-manifest');
  });

  it('should not create tool manifest if it exists', async () => {
    tree.write('.config/dotnet-tools.json', '');
    const spy = jest.spyOn(dotnetClient, 'new');
    await generator(tree, null, dotnetClient);
    expect(spy).not.toHaveBeenCalled();
  });

  it('should add restore to prepare script', async () => {
    await generator(tree, null, dotnetClient);
    const updated = readJson(tree, 'package.json');
    expect(updated.scripts.prepare).toBe('nx g @nx-dotnet/core:restore');
  });

  it('should not add restore if it already exists', async () => {
    const packageJson = {
      scripts: { prepare: 'nx g @nx-dotnet/core:restore' },
    };
    writeJson(tree, 'package.json', packageJson);
    await generator(tree, null, dotnetClient);
    const updated = readJson(tree, 'package.json');
    expect(updated.scripts.prepare).toBe('nx g @nx-dotnet/core:restore');
  });

  it('should add restore to existing prepare steps', async () => {
    const packageJson = {
      scripts: { prepare: 'npm run clean && npm run build' },
    };
    writeJson(tree, 'package.json', packageJson);
    await generator(tree, null, dotnetClient);
    const updated = readJson(tree, 'package.json');
    expect(updated.scripts.prepare).toBe(
      'npm run clean && npm run build && nx g @nx-dotnet/core:restore',
    );
  });

  it('should add directory build props and targets files', async () => {
    await generator(tree, null, dotnetClient);
    const hasPropsFile = tree.isFile('Directory.Build.props');
    expect(hasPropsFile).toBeTruthy();

    const hasTargetsFile = tree.isFile('Directory.Build.targets');
    expect(hasTargetsFile).toBeTruthy();
    const hasPreBuildTask = tree
      .read('Directory.Build.targets', 'utf-8')
      ?.includes('check-module-boundaries.js');
    expect(hasPreBuildTask).toBeTruthy();
  });

  it('should not add directory build props and targets files if props file exists', async () => {
    tree.write('Directory.Build.props', '');
    const spy = jest.spyOn(devkit, 'generateFiles');
    await generator(tree, null, dotnetClient);

    expect(spy).not.toHaveBeenCalled();
    const hasTargetsFile = tree.isFile('Directory.Build.targets');
    expect(hasTargetsFile).toBeFalsy();
  });
});
