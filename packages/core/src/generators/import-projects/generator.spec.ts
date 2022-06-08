import { getProjects, readProjectConfiguration, Tree } from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';

import * as fs from 'fs';

import * as utils from '@nx-dotnet/utils';

import generator from './generator';

jest.mock('@nx-dotnet/utils', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...(jest.requireActual('@nx-dotnet/utils') as any),
  glob: jest.fn(),
  findProjectFileInPath: jest.fn(),
  resolve: (m: string) => m,
}));

const MOCK_API_PROJECT = `
<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup>
    <TargetFramework>net5.0</TargetFramework>
    <RootNamespace>MyTestApi</RootNamespace>
  </PropertyGroup>
</Project>`;

const MOCK_TEST_PROJECT = `
<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup>
    <TargetFramework>net5.0</TargetFramework>
    <RootNamespace>MyTestApi.Test</RootNamespace>
  </PropertyGroup>
  <ItemGroup>
    <PackageReference Include="Microsoft.NET.Test.Sdk" Version="16.5.0" />
  </ItemGroup>
</Project>`;

describe('import-projects generator', () => {
  let appTree: Tree;

  beforeEach(() => {
    appTree = createTreeWithEmptyWorkspace();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should run successfully if no new projects are found', async () => {
    jest.spyOn(utils, 'glob').mockResolvedValue([]);
    const promise = generator(appTree);
    const oldProjects = getProjects(appTree);
    await expect(promise).resolves.not.toThrow();
    const newProjects = getProjects(appTree);
    expect(oldProjects).toEqual(newProjects);
  });

  it('should run successfully if new projects are found', async () => {
    jest
      .spyOn(utils, 'glob')
      .mockImplementation((x) =>
        Promise.resolve(
          x.startsWith('apps') ? ['apps/my-api/my-api.csproj'] : [],
        ),
      );
    jest
      .spyOn(utils, 'findProjectFileInPath')
      .mockImplementation((x) =>
        x.startsWith('apps')
          ? Promise.resolve('apps/my-api/my-api.csproj')
          : Promise.reject(),
      );
    jest.spyOn(fs, 'readFileSync').mockReturnValue(MOCK_TEST_PROJECT);
    jest.spyOn(fs, 'writeFileSync').mockImplementation(() => null);
    appTree.write('apps/my-api/my-api.csproj', MOCK_API_PROJECT);
    const promise = generator(appTree);
    await expect(promise).resolves.not.toThrow();
    expect(readProjectConfiguration(appTree, 'my-test-api')).toBeDefined();
  });

  it('should run add test target if test projects are found', async () => {
    jest
      .spyOn(utils, 'glob')
      .mockImplementation((x) =>
        Promise.resolve(
          x.startsWith('apps') ? ['apps/my-api-test/my-api-test.csproj'] : [],
        ),
      );
    jest
      .spyOn(utils, 'findProjectFileInPath')
      .mockImplementation((x) =>
        x.startsWith('apps')
          ? Promise.resolve('apps/my-api/my-api-test.csproj')
          : Promise.reject(),
      );
    jest.spyOn(fs, 'readFileSync').mockReturnValue(MOCK_TEST_PROJECT);
    jest.spyOn(fs, 'writeFileSync').mockImplementation(() => null);
    appTree.write('apps/my-api-test/my-api-test.csproj', MOCK_TEST_PROJECT);
    const promise = generator(appTree);
    await expect(promise).resolves.not.toThrow();
    expect(readProjectConfiguration(appTree, 'my-test-api-test')).toBeDefined();
    expect(
      readProjectConfiguration(appTree, 'my-test-api-test').targets?.test,
    ).toBeDefined();
    expect(
      readProjectConfiguration(appTree, 'my-test-api-test').targets?.serve,
    ).not.toBeDefined();
  });
});
