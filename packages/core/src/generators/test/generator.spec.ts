import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';

import { DotNetClient, dotnetFactory } from '@nx-dotnet/dotnet';

import generator, { calculateTestTargetNameAndRoot } from './generator';

import {
  addProjectConfiguration,
  readProjectConfiguration,
  Tree,
  writeJson,
} from '@nx/devkit';

import * as fs from 'fs';

import * as utils from '@nx-dotnet/utils';

import { initGenerator } from '../init/generator';
import { NxDotnetTestGeneratorSchema } from '../../models';

jest.mock('@nx-dotnet/utils', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...(jest.requireActual('@nx-dotnet/utils') as any),
  glob: jest.fn(),
  findProjectFileInPath: jest.fn(),
  resolve: (m: string) => m,
}));

describe('nx-dotnet test project generator', () => {
  let tree: Tree;
  let dotnetClient: DotNetClient;
  let options: NxDotnetTestGeneratorSchema;
  let testProjectName: string;

  beforeEach(async () => {
    tree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
    tree.write('package.json', '{}');
    await initGenerator(tree, null, new DotNetClient(dotnetFactory()));
    addProjectConfiguration(tree, 'domain-existing-app', {
      root: 'apps/domain/existing-app',
      projectType: 'application',
      targets: {},
    });
    addProjectConfiguration(tree, 'domain-existing-lib', {
      root: 'libs/domain/existing-lib',
      projectType: 'library',
      targets: {},
    });

    fs.mkdirSync('apps/domain/existing-app', { recursive: true });
    jest
      .spyOn(utils, 'glob')
      .mockResolvedValue([
        'apps/domain/existing-app/Proj.Domain.ExistingApp.csproj',
      ]);
    jest
      .spyOn(utils, 'findProjectFileInPath')
      .mockResolvedValue(
        'apps/domain/existing-app/Proj.Domain.ExistingApp.csproj',
      );

    dotnetClient = new DotNetClient(dotnetFactory());

    const packageJson = { scripts: {} };
    writeJson(tree, 'package.json', packageJson);

    options = {
      targetProject: 'domain-existing-app',
      testTemplate: 'xunit',
      language: 'C#',
      pathScheme: 'nx',
      skipFormat: true,
    };
    testProjectName = options.targetProject + '-test';
  });

  it('should include test target', async () => {
    await generator(tree, options, dotnetClient);
    const config = readProjectConfiguration(tree, testProjectName);
    expect(config.targets?.test).toBeDefined();
  });

  it('should set outputs for build target', async () => {
    await generator(tree, options, dotnetClient);
    const config = readProjectConfiguration(tree, testProjectName);
    const outputPath = config.targets?.build.outputs?.[0];
    expect(outputPath).toEqual(
      '{workspaceRoot}/dist/apps/domain/existing-app-test',
    );
  });

  it('should include lint target', async () => {
    await generator(tree, options, dotnetClient);
    const config = readProjectConfiguration(tree, testProjectName);
    expect(config.targets?.lint).toBeDefined();
  });

  it('should determine directory from existing project', async () => {
    await generator(tree, options, dotnetClient);
    const config = readProjectConfiguration(tree, testProjectName);
    expect(config.root).toBe('apps/domain/existing-app-test');
  });

  it('should determine directory from existing project and suffix', async () => {
    options.suffix = 'integration-tests';
    testProjectName = options.targetProject + '-' + options.suffix;
    await generator(tree, options, dotnetClient);
    const config = readProjectConfiguration(tree, testProjectName);
    expect(config.root).toBe('apps/domain/existing-app-integration-tests');
  });

  describe('calculateTestTargetNameAndRoot', () => {
    it('should handle names that dont contain path segments', () => {
      expect(
        calculateTestTargetNameAndRoot(
          'nx',
          'existing-app',
          'apps/domain/existing-app',
        ),
      ).toMatchInlineSnapshot(`
        {
          "name": "existing-app-test",
          "root": "apps/domain/existing-app-test",
        }
      `);
    });

    it('should handle names that contain path segments', () => {
      expect(
        calculateTestTargetNameAndRoot(
          'nx',
          'domain-existing-app',
          'apps/domain/existing-app',
        ),
      ).toMatchInlineSnapshot(`
        {
          "name": "domain-existing-app-test",
          "root": "apps/domain/existing-app-test",
        }
      `);
    });

    it('should handle names with multiple path segments', () => {
      expect(
        calculateTestTargetNameAndRoot(
          'nx',
          'shared-domain-existing-app',
          'apps/shared/domain/existing-app',
        ),
      ).toMatchInlineSnapshot(`
        {
          "name": "shared-domain-existing-app-test",
          "root": "apps/shared/domain/existing-app-test",
        }
      `);
    });

    it('should handle roots that contain a portion of the project name', () => {
      expect(
        calculateTestTargetNameAndRoot(
          'nx',
          'shared-existing-app',
          'apps/shared/domain/shared-existing-app',
        ),
      ).toMatchInlineSnapshot(`
        {
          "name": "shared-existing-app-test",
          "root": "apps/shared/domain/shared-existing-app-test",
        }
      `);
    });
  });
});
