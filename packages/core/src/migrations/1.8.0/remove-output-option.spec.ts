import {
  addProjectConfiguration,
  readProjectConfiguration,
  stripIndents,
  Tree,
} from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';

import * as utils from '@nx-dotnet/utils';

import update from './remove-output-option';

jest.mock('@nx-dotnet/utils', () => ({
  ...(jest.requireActual('@nx-dotnet/utils') as typeof utils),
  getProjectFileForNxProject: () =>
    Promise.resolve('apps/my-app/my-app.csproj'),
}));

describe('remove-output-option', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
  });

  it('should not update projects where output != OutputPath', async () => {
    tree.write(
      '/apps/my-app/my-app.csproj',
      stripIndents`<Root>
        <PropertyGroup>
          <OutputPath>./dist/apps/my-app</OutputPath>
        </PropertyGroup>
      </Root>`,
    );

    addProjectConfiguration(tree, 'my-app', {
      root: 'apps/my-app',
      targets: {
        build: {
          executor: '@nx-dotnet/core:build',
          options: {
            output: 'dist/apps/my-app',
          },
        },
      },
    });

    await expect(update(tree)).resolves.not.toThrow();

    const projectConfiguration = readProjectConfiguration(tree, 'my-app');
    expect(projectConfiguration.targets?.build?.options?.output).toEqual(
      'dist/apps/my-app',
    );
  });

  it('should update projects where output == OutputPath', async () => {
    tree.write(
      '/apps/my-app/my-app.csproj',
      stripIndents`<Root>
        <PropertyGroup>
          <OutputPath>../../dist/apps/my-app</OutputPath>
        </PropertyGroup>
      </Root>`,
    );

    addProjectConfiguration(tree, 'my-app', {
      root: 'apps/my-app',
      targets: {
        build: {
          executor: '@nx-dotnet/core:build',
          outputs: ['{options.output}'],
          options: {
            output: 'dist/apps/my-app',
          },
        },
      },
    });

    await expect(update(tree)).resolves.not.toThrow();

    const projectConfiguration = readProjectConfiguration(tree, 'my-app');
    expect(
      projectConfiguration.targets?.build?.options?.output,
    ).toBeUndefined();
    expect(projectConfiguration.targets?.build?.outputs).toEqual([
      'dist/apps/my-app',
    ]);
  });

  it('should not update projects where OutputPath is not set', async () => {
    tree.write(
      '/apps/my-app/my-app.csproj',
      stripIndents`<Root>
        <PropertyGroup>
        </PropertyGroup>
      </Root>`,
    );

    addProjectConfiguration(tree, 'my-app', {
      root: 'apps/my-app',
      targets: {
        build: {
          executor: '@nx-dotnet/core:build',
          options: {
            output: 'dist/apps/my-app',
          },
        },
      },
    });

    await expect(update(tree)).resolves.not.toThrow();

    const projectConfiguration = readProjectConfiguration(tree, 'my-app');
    expect(projectConfiguration.targets?.build?.options?.output).toEqual(
      'dist/apps/my-app',
    );
  });
});
