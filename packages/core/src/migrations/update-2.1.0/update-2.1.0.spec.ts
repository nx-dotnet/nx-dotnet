import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { readNxJson, Tree } from '@nx/devkit';

import update from './update-2.1.0';

describe('update-2.1.0 migration', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
  });

  it('should update `inferProjectTargets` to `inferTargets`', () => {
    tree.write(
      'nx.json',
      JSON.stringify({
        plugins: [
          {
            plugin: '@nx-dotnet/core',
            options: { inferProjectTargets: false },
          },
        ],
      }),
    );
    update(tree);
    expect(readNxJson(tree)?.plugins).toMatchInlineSnapshot(`
      [
        {
          "options": {
            "inferredTargets": false,
          },
          "plugin": "@nx-dotnet/core",
        },
      ]
    `);
  });

  it('should be a noop for already migrated configs', () => {
    tree.write(
      'nx.json',
      JSON.stringify({
        plugins: [
          {
            plugin: '@nx-dotnet/core',
            options: { inferredTargets: false },
          },
        ],
      }),
    );
    update(tree);
    expect(readNxJson(tree)?.plugins).toMatchInlineSnapshot(`
      [
        {
          "options": {
            "inferredTargets": false,
          },
          "plugin": "@nx-dotnet/core",
        },
      ]
    `);
  });

  it('should not update plugins array if using default options', () => {
    tree.write(
      'nx.json',
      JSON.stringify({
        plugins: [{ plugin: '@nx-dotnet/core' }],
      }),
    );
    update(tree);
    expect(readNxJson(tree)?.plugins).toMatchInlineSnapshot(`
      [
        {
          "plugin": "@nx-dotnet/core",
        },
      ]
    `);
  });

  it("shouldn't update plugins array if not using nx-dotnet", () => {
    tree.write(
      'nx.json',
      JSON.stringify({
        plugins: [{ plugin: '@nx/jest/add-targets' }],
      }),
    );
    update(tree);
    expect(readNxJson(tree)?.plugins).toMatchInlineSnapshot(`
      [
        {
          "plugin": "@nx/jest/add-targets",
        },
      ]
    `);
  });
});
