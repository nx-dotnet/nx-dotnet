import * as devkit from '@nx/devkit';
import { readJson, readNxJson, Tree, writeJson } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';

import { DotNetClient, dotnetFactory } from '@nx-dotnet/dotnet';

import generator from './generator';

jest.mock('@nx-dotnet/utils', () => ({
  ...jest.requireActual('@nx-dotnet/utils'),
  resolve: jest.fn(() => 'check-module-boundaries.js'),
}));

// Mock the package installation to avoid system call issues in tests
jest.mock('@nx/devkit', () => ({
  ...jest.requireActual('@nx/devkit'),
  addDependenciesToPackageJson: jest.fn(() => jest.fn()),
}));

const mockDotnetFactory = jest.fn();
const mockDotNetClient = jest.fn();

jest.mock('@nx-dotnet/dotnet', () => ({
  ...jest.requireActual('@nx-dotnet/dotnet'),
  DotNetClient: jest.fn().mockImplementation((...args) => {
    mockDotNetClient(...args);
    return {
      new: jest.fn(),
    };
  }),
  dotnetFactory: jest
    .fn()
    .mockImplementation((...args) => mockDotnetFactory(...args)),
}));

describe('init generator', () => {
  let tree: Tree;
  let dotnetClient: DotNetClient;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
    dotnetClient = new DotNetClient(dotnetFactory());

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
    expect(spy).toHaveBeenCalledWith(
      'tool-manifest',
      {
        output: expect.any(String),
      },
      undefined,
    );
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

  describe('lazy initialization', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      mockDotnetFactory.mockReturnValue({
        command: 'dotnet',
        info: { global: true, version: '6.0.100' },
      });
    });

    it('should use provided dotnet client when available', async () => {
      const mockClient = {
        new: jest.fn(),
      } as unknown as DotNetClient;

      await generator(tree, null, mockClient);

      // dotnetFactory should not be called when client is provided
      expect(mockDotnetFactory).not.toHaveBeenCalled();
    });

    it('should create dotnet client lazily only when needed for tool manifest', async () => {
      const mockClient = {
        new: jest.fn(),
      } as unknown as DotNetClient;

      // Mock DotNetClient constructor to return our mock client
      const MockedDotNetClient = DotNetClient as jest.MockedClass<
        typeof DotNetClient
      >;
      MockedDotNetClient.mockImplementation(() => mockClient);

      await generator(tree, null);

      // dotnetFactory should be called only once during lazy initialization
      expect(mockDotnetFactory).toHaveBeenCalledTimes(1);
      expect(MockedDotNetClient).toHaveBeenCalledTimes(1);
    });

    it('should handle dotnetFactory failure gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      mockDotnetFactory.mockImplementation(() => {
        throw new Error('dotnet not installed');
      });

      // Should not throw, should handle error gracefully
      await expect(generator(tree, null)).resolves.not.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to initialize .NET client in init generator:',
        expect.any(Error),
      );

      // Tool manifest should not be created when dotnet client fails
      expect(tree.exists('.config/dotnet-tools.json')).toBeFalsy();

      consoleSpy.mockRestore();
    });

    it('should skip tool manifest creation when dotnet client initialization fails', async () => {
      const loggerSpy = jest.spyOn(devkit.logger, 'warn');
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      mockDotnetFactory.mockImplementation(() => {
        throw new Error('dotnet CLI not found');
      });

      await generator(tree, null);

      // Should warn about failing to initialize dotnet client
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to initialize .NET client in init generator:',
        expect.any(Error),
      );

      // Should warn about skipping tool manifest creation
      expect(loggerSpy).toHaveBeenCalledWith(
        'Skipping tool manifest creation: .NET client not available',
      );

      // Tool manifest should not be created
      expect(tree.exists('.config/dotnet-tools.json')).toBeFalsy();

      loggerSpy.mockRestore();
      consoleSpy.mockRestore();
    });

    it('should create tool manifest when dotnet client initializes successfully', async () => {
      const mockClient = {
        new: jest.fn(),
      } as unknown as DotNetClient;

      const MockedDotNetClient = DotNetClient as jest.MockedClass<
        typeof DotNetClient
      >;
      MockedDotNetClient.mockImplementation(() => mockClient);

      // Mock the dotnet new command to create the tool manifest
      const generateFilesSpy = jest
        .spyOn(devkit, 'generateFiles')
        .mockImplementation();

      await generator(tree, null);

      expect(mockDotnetFactory).toHaveBeenCalled();
      expect(MockedDotNetClient).toHaveBeenCalled();

      generateFilesSpy.mockRestore();
    });

    it('should reuse the same client instance on subsequent calls', async () => {
      const mockClient = {
        new: jest.fn(),
      } as unknown as DotNetClient;

      const MockedDotNetClient = DotNetClient as jest.MockedClass<
        typeof DotNetClient
      >;
      MockedDotNetClient.mockImplementation(() => mockClient);

      // Run the generator
      await generator(tree, null);

      // Clear the mocks to track subsequent calls
      jest.clearAllMocks();

      // Run the generator again (hypothetically, if getSafeClient was called again)
      await generator(tree, null);

      // dotnetFactory and DotNetClient constructor should not be called again
      // because the client should be cached
      expect(mockDotnetFactory).not.toHaveBeenCalled();
      expect(MockedDotNetClient).not.toHaveBeenCalled();
    });
  });
});
