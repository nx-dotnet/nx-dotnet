import { Tree, writeJson } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import * as ESLintNamespace from 'eslint';
import * as fastGlob from 'fast-glob';
import { vol } from 'memfs';

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
    notDependOnLibsWithTags: ['a', 'shared'],
    sourceTag: 'b',
  },
  {
    onlyDependOnLibsWithTags: ['shared'],
    sourceTag: 'shared',
  },
  {
    onlyDependOnLibsWithTags: ['z'],
    allSourceTags: ['x', 'only-z'],
  },
  {
    notDependOnLibsWithTags: ['z'],
    allSourceTags: ['x', 'not-z'],
  },
  {
    onlyDependOnLibsWithTags: [],
    sourceTag: 'no-deps',
  },
  {
    onlyDependOnLibsWithTags: ['*baz*'],
    allSourceTags: ['--f*o--'],
  },
  {
    notDependOnLibsWithTags: ['b*z'],
    sourceTag: '--f*o--',
  },
  {
    onlyDependOnLibsWithTags: ['/.*baz.*$/'],
    allSourceTags: ['/^==f[o]{2}==$/'],
  },
  {
    notDependOnLibsWithTags: ['/^b.*z$/'],
    sourceTag: '/^==f[o]{2}==$/',
  },
];

describe('load-module-boundaries', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should not load eslint if boundaries in config', async () => {
    const eslintConstructorSpy = jest.spyOn(ESLintNamespace, 'ESLint');
    writeJson<NxDotnetConfig>(tree, CONFIG_FILE_PATH, {
      moduleBoundaries: MOCK_BOUNDARIES,
      nugetPackages: {},
    });
    const boundaries = await loadModuleBoundaries('', tree);
    expect(eslintConstructorSpy).not.toHaveBeenCalled();
    expect(boundaries).toEqual(MOCK_BOUNDARIES);
  });

  it.each([
    '@nrwl/nx/enforce-module-boundaries',
    '@nx/enforce-module-boundaries',
  ])(
    'should load from eslint if boundaries not in config',
    async (eslintRuleName) => {
      const eslintConfigSpy = jest
        .spyOn(ESLintNamespace, 'ESLint')
        .mockReturnValue({
          calculateConfigForFile: jest.fn().mockResolvedValue({
            rules: {
              [eslintRuleName]: [1, { depConstraints: MOCK_BOUNDARIES }],
            },
          }),
        } as unknown as ESLintNamespace.ESLint);
      writeJson<NxDotnetConfig>(tree, CONFIG_FILE_PATH, {
        nugetPackages: {},
      });
      const boundaries = await loadModuleBoundaries('', tree);
      expect(eslintConfigSpy).toHaveBeenCalledTimes(1);
      expect(boundaries).toEqual(MOCK_BOUNDARIES);
    },
  );
});

// eslint-disable-next-line @typescript-eslint/no-var-requires
jest.mock('fs', () => require('memfs').fs);

describe('enforce-module-boundaries', () => {
  beforeEach(() => {
    jest.spyOn(ESLintNamespace, 'ESLint').mockReturnValue({
      calculateConfigForFile: jest.fn().mockResolvedValue({
        rules: {
          '@nx/enforce-module-boundaries': [
            1,
            { depConstraints: MOCK_BOUNDARIES },
          ],
        },
      }),
    } as unknown as ESLintNamespace.ESLint);
  });

  afterEach(() => {
    jest.resetAllMocks();
    vol.reset();
  });

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

  it('should find violations with sourceTag/onlyDependOnLibsWithTags', async () => {
    const globResults = ['libs/a/a.csproj'];
    jest.spyOn(fastGlob, 'sync').mockImplementation(() => globResults);

    vol.fromJSON({
      'libs/a/a.csproj':
        '<Project Sdk="Microsoft.NET.Sdk.Web"><ItemGroup><ProjectReference Include="..\\..\\libs\\ui\\ui.csproj" /></ItemGroup></Project>',
    });

    const results = await checkModuleBoundariesForProject('a', {
      a: {
        tags: ['a'],
        targets: { ui: {} },
        root: 'libs/a',
      },
      ui: {
        tags: ['ui'],
        targets: {},
        root: 'libs/ui',
      },
    });
    expect(results).toHaveLength(1);
  });

  it('should find violations with sourceTag/notDependOnLibsWithTags', async () => {
    const globResults = ['libs/b/b.csproj'];
    jest.spyOn(fastGlob, 'sync').mockImplementation(() => globResults);

    vol.fromJSON({
      'libs/b/b.csproj':
        '<Project Sdk="Microsoft.NET.Sdk.Web"><ItemGroup><ProjectReference Include="..\\..\\libs\\a\\a.csproj" /></ItemGroup></Project>',
    });

    const results = await checkModuleBoundariesForProject('b', {
      a: {
        tags: ['a'],
        targets: {},
        root: 'libs/a',
      },
      b: {
        tags: ['b'],
        targets: { a: {} },
        root: 'libs/b',
      },
    });
    expect(results).toHaveLength(1);
  });

  it('should pass without violations with single source rule (sourceTag)', async () => {
    const globResults = ['libs/a/a.csproj'];
    jest.spyOn(fastGlob, 'sync').mockImplementation(() => globResults);

    vol.fromJSON({
      'libs/a/a.csproj':
        '<Project Sdk="Microsoft.NET.Sdk.Web"><ItemGroup><ProjectReference Include="..\\..\\libs\\shared\\shared.csproj" /></ItemGroup></Project>',
    });

    const results = await checkModuleBoundariesForProject('a', {
      a: {
        tags: ['a'],
        targets: { shared: {} },
        root: 'libs/a',
      },
      shared: {
        tags: ['shared'],
        targets: {},
        root: 'libs/shared',
      },
    });
    expect(results).toHaveLength(0);
  });

  it('should find violations with allSourceTags/notDependOnLibsWithTags', async () => {
    const globResults = ['libs/x/x.csproj'];
    jest.spyOn(fastGlob, 'sync').mockImplementation(() => globResults);

    vol.fromJSON({
      'libs/x/x.csproj':
        '<Project Sdk="Microsoft.NET.Sdk.Web"><ItemGroup><ProjectReference Include="..\\..\\libs\\z\\z.csproj" /></ItemGroup></Project>',
    });

    const results = await checkModuleBoundariesForProject('x', {
      x: {
        tags: ['x', 'not-z'],
        targets: { z: {} },
        root: 'libs/x',
      },
      z: {
        tags: ['z'],
        targets: {},
        root: 'libs/z',
      },
    });
    expect(results).toHaveLength(1);
  });

  it('should find violations with allSourceTags/onlyDependOnLibsWithTags', async () => {
    const globResults = ['libs/x/x.csproj'];
    jest.spyOn(fastGlob, 'sync').mockImplementation(() => globResults);

    vol.fromJSON({
      'libs/x/x.csproj':
        '<Project Sdk="Microsoft.NET.Sdk.Web"><ItemGroup><ProjectReference Include="..\\..\\libs\\a\\a.csproj" /></ItemGroup></Project>',
    });

    const results = await checkModuleBoundariesForProject('x', {
      x: {
        tags: ['x', 'only-z'],
        targets: { a: {} },
        root: 'libs/x',
      },
      a: {
        tags: ['a'],
        targets: {},
        root: 'libs/a',
      },
    });
    expect(results).toHaveLength(1);
  });

  it('should pass without violations with single source rule (allSourceTags)', async () => {
    const globResults = ['libs/x/x.csproj'];
    jest.spyOn(fastGlob, 'sync').mockImplementation(() => globResults);

    vol.fromJSON({
      'libs/x/x.csproj':
        '<Project Sdk="Microsoft.NET.Sdk.Web"><ItemGroup><ProjectReference Include="..\\..\\libs\\z\\z.csproj" /></ItemGroup></Project>',
    });

    const results = await checkModuleBoundariesForProject('x', {
      x: {
        tags: ['x', 'only-z'],
        targets: { z: {} },
        root: 'libs/x',
      },
      z: {
        tags: ['z'],
        targets: {},
        root: 'libs/z',
      },
    });
    expect(results).toHaveLength(0);
  });

  it('should support { onlyDependOnLibsWithTags: [] } - no dependencies', async () => {
    const globResults = ['libs/x/x.csproj'];
    jest.spyOn(fastGlob, 'sync').mockImplementation(() => globResults);

    vol.fromJSON({
      'libs/x/x.csproj':
        '<Project Sdk="Microsoft.NET.Sdk.Web"><ItemGroup><ProjectReference Include="..\\..\\libs\\a\\a.csproj" /></ItemGroup></Project>',
    });

    const results = await checkModuleBoundariesForProject('x', {
      x: {
        tags: ['no-deps'],
        targets: { a: {} },
        root: 'libs/x',
      },
      a: {
        tags: ['a'],
        targets: {},
        root: 'libs/a',
      },
    });
    expect(results).toHaveLength(1);
  });

  it('should support glob wildcards', async () => {
    const globResults = ['libs/x/x.csproj'];
    jest.spyOn(fastGlob, 'sync').mockImplementation(() => globResults);

    vol.fromJSON({
      'libs/x/x.csproj':
        '<Project Sdk="Microsoft.NET.Sdk.Web"><ItemGroup><ProjectReference Include="..\\..\\libs\\a\\a.csproj" /></ItemGroup></Project>',
    });

    const results = await checkModuleBoundariesForProject('x', {
      x: {
        tags: ['--foo--'],
        targets: { a: {} },
        root: 'libs/x',
      },
      a: {
        tags: ['biz'],
        targets: {},
        root: 'libs/a',
      },
    });
    expect(results).toHaveLength(2);
  });

  it('should support regexp', async () => {
    const globResults = ['libs/x/x.csproj'];
    jest.spyOn(fastGlob, 'sync').mockImplementation(() => globResults);

    vol.fromJSON({
      'libs/x/x.csproj':
        '<Project Sdk="Microsoft.NET.Sdk.Web"><ItemGroup><ProjectReference Include="..\\..\\libs\\a\\a.csproj" /></ItemGroup></Project>',
    });

    const results = await checkModuleBoundariesForProject('x', {
      x: {
        tags: ['==foo=='],
        targets: { a: {} },
        root: 'libs/x',
      },
      a: {
        tags: ['biz'],
        targets: {},
        root: 'libs/a',
      },
    });
    expect(results).toHaveLength(2);
  });
});
