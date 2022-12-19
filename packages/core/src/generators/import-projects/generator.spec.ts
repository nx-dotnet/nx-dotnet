import { getProjects, readProjectConfiguration, Tree } from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';

import * as fs from 'fs';

import { DotNetClient, mockDotnetFactory } from '@nx-dotnet/dotnet';
import * as utils from '@nx-dotnet/utils';

import * as mockedInitGenerator from '../init/generator';
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

jest.mock('../init/generator', () => ({
  initGenerator: jest.fn(() => {
    return Promise.resolve(jest.fn(() => Promise.resolve()));
  }),
}));

describe('import-projects generator', () => {
  let tree: Tree;
  let dotnetClient: DotNetClient;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
    dotnetClient = new DotNetClient(mockDotnetFactory());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should run successfully if no new projects are found', async () => {
    jest.spyOn(utils, 'glob').mockResolvedValue([]);
    const promise = generator(tree, null, dotnetClient);
    const oldProjects = getProjects(tree);
    await expect(promise).resolves.not.toThrow();
    const newProjects = getProjects(tree);
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
    tree.write('apps/my-api/my-api.csproj', MOCK_API_PROJECT);
    const promise = generator(tree, null, dotnetClient);
    await expect(promise).resolves.not.toThrow();
    expect(readProjectConfiguration(tree, 'my-test-api')).toBeDefined();
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
    tree.write('apps/my-api-test/my-api-test.csproj', MOCK_TEST_PROJECT);
    const promise = generator(tree, null, dotnetClient);
    await expect(promise).resolves.not.toThrow();
    expect(readProjectConfiguration(tree, 'my-test-api-test')).toBeDefined();
    expect(
      readProjectConfiguration(tree, 'my-test-api-test').targets?.test,
    ).toBeDefined();
    expect(
      readProjectConfiguration(tree, 'my-test-api-test').targets?.serve,
    ).not.toBeDefined();
  });

  it('should call init generator', async () => {
    const initGenerator = (
      mockedInitGenerator as jest.Mocked<typeof mockedInitGenerator>
    ).initGenerator;

    jest.spyOn(utils, 'glob').mockResolvedValue([]);
    await generator(tree, null, dotnetClient);
    expect(initGenerator).toHaveBeenCalledWith(tree, null, dotnetClient);
  });
});
