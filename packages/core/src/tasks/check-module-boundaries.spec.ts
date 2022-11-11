import { Tree, writeJson } from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';

import * as ESLintNamespace from 'eslint';

import {
  CONFIG_FILE_PATH,
  ModuleBoundaries,
  NxDotnetConfig,
} from '@nx-dotnet/utils';

import * as checkModule from './check-module-boundaries';
import {
  checkModuleBoundariesForProject,
  loadModuleBoundaries,
} from './check-module-boundaries';

const MOCK_BOUNDARIES: ModuleBoundaries = [
  {
    onlyDependOnLibsWithTags: ['a', 'shared'],
    sourceTag: 'a',
  },
  {
    onlyDependOnLibsWithTags: ['b', 'shared'],
    sourceTag: 'b',
  },
  {
    onlyDependOnLibsWithTags: ['shared'],
    sourceTag: 'shared',
  },
];

describe('load-module-boundaries', () => {
  let appTree: Tree;

  beforeEach(() => {
    appTree = createTreeWithEmptyWorkspace();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should not load eslint if boundaries in config', async () => {
    const eslintConstructorSpy = jest.spyOn(ESLintNamespace, 'ESLint');
    writeJson<NxDotnetConfig>(appTree, CONFIG_FILE_PATH, {
      moduleBoundaries: MOCK_BOUNDARIES,
      nugetPackages: {},
    });
    const boundaries = await loadModuleBoundaries('', appTree);
    expect(eslintConstructorSpy).not.toHaveBeenCalled();
    expect(boundaries).toEqual(MOCK_BOUNDARIES);
  });

  it('should load from eslint if boundaries not in config', async () => {
    const eslintConfigSpy = jest
      .spyOn(ESLintNamespace, 'ESLint')
      .mockReturnValue({
        calculateConfigForFile: jest.fn().mockResolvedValue({
          rules: {
            '@nrwl/nx/enforce-module-boundaries': [
              1,
              { depConstraints: MOCK_BOUNDARIES },
            ],
          },
        }),
      } as unknown as ESLintNamespace.ESLint);
    writeJson<NxDotnetConfig>(appTree, CONFIG_FILE_PATH, {
      nugetPackages: {},
    });
    const boundaries = await loadModuleBoundaries('', appTree);
    expect(eslintConfigSpy).toHaveBeenCalledTimes(1);
    expect(boundaries).toEqual(MOCK_BOUNDARIES);
  });
});

describe('enforce-module-boundaries', () => {
  it('should exit early if no tags on project', async () => {
    const spy = jest.spyOn(checkModule, 'loadModuleBoundaries');
    const results = await checkModuleBoundariesForProject('a', {
      a: {
        tags: [],
        targets: {},
        root: '',
      },
    });
    expect(spy).not.toHaveBeenCalled();
    expect(results).toHaveLength(0);
  });
});
