import {
  workspaceRoot,
  CreateDependenciesContext,
  DependencyType,
  ProjectConfiguration,
  ProjectFileMap,
} from '@nx/devkit';
import { NxDotnetConfig } from '@nx-dotnet/utils';
import {
  createDependencies,
  resolveReferenceToProject,
} from './create-dependencies';

// Mock the entire @nx-dotnet/dotnet module before any imports
const mockGetProjectReferencesAsync = jest.fn();
const mockDotNetClient = jest.fn();
const mockDotnetFactory = jest.fn();

jest.mock('@nx-dotnet/dotnet', () => ({
  ...jest.requireActual('@nx-dotnet/dotnet'),
  DotNetClient: (...args: unknown[]) => {
    mockDotNetClient(...args);
    return {
      getProjectReferencesAsync: (...refArgs: unknown[]) =>
        mockGetProjectReferencesAsync(...refArgs),
    };
  },
  dotnetFactory: (...args: unknown[]) => mockDotnetFactory(...args),
}));

describe('createDependencies', () => {
  let mockContext: CreateDependenciesContext;
  let mockProjects: Record<string, ProjectConfiguration>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetProjectReferencesAsync.mockReset();

    mockProjects = {
      'my-app': {
        name: 'my-app',
        root: 'apps/my-app',
        targets: {},
      },
      'my-lib': {
        name: 'my-lib',
        root: 'libs/my-lib',
        targets: {},
      },
    };

    mockContext = {
      workspaceRoot,
      projects: mockProjects,
      nxJsonConfiguration: {},
      externalNodes: {},
      fileMap: {
        projectFileMap: {},
        nonProjectFiles: [],
      },
      filesToProcess: {
        projectFileMap: {},
        nonProjectFiles: [],
      },
    };
  });

  describe('greenfield scenarios (no .NET projects)', () => {
    it('should return empty array when no project files to process', async () => {
      mockContext.filesToProcess.projectFileMap = {};

      const result = await createDependencies(mockContext, undefined);

      expect(result).toEqual([]);
      expect(mockGetProjectReferencesAsync).not.toHaveBeenCalled();
    });

    it('should return empty array when projectFileMap is null/undefined', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockContext.filesToProcess.projectFileMap =
        null as unknown as ProjectFileMap;

      const result = await createDependencies(mockContext, undefined);

      expect(result).toEqual([]);
      expect(mockGetProjectReferencesAsync).not.toHaveBeenCalled();
    });

    it('should return empty array when no .NET project files found', async () => {
      mockContext.filesToProcess.projectFileMap = {
        'my-app': [
          { file: 'apps/my-app/package.json', hash: 'hash1' },
          { file: 'apps/my-app/src/index.ts', hash: 'hash2' },
        ],
        'my-lib': [{ file: 'libs/my-lib/index.js', hash: 'hash3' }],
      };

      const result = await createDependencies(mockContext, undefined);

      expect(result).toEqual([]);
      expect(mockGetProjectReferencesAsync).not.toHaveBeenCalled();
    });

    it('should return empty array when mixed files but no .NET projects', async () => {
      mockContext.filesToProcess.projectFileMap = {
        'web-app': [
          { file: 'apps/web-app/package.json', hash: 'hash1' },
          { file: 'apps/web-app/angular.json', hash: 'hash2' },
        ],
        'ui-lib': [
          { file: 'libs/ui-lib/project.json', hash: 'hash3' },
          { file: 'libs/ui-lib/tsconfig.json', hash: 'hash4' },
        ],
      };

      const result = await createDependencies(mockContext, undefined);

      expect(result).toEqual([]);
      expect(mockGetProjectReferencesAsync).not.toHaveBeenCalled();
    });
  });

  describe('brownfield scenarios (with .NET projects)', () => {
    beforeEach(() => {
      mockContext.filesToProcess.projectFileMap = {
        'my-app': [
          { file: 'apps/my-app/MyApp.csproj', hash: 'hash1' },
          { file: 'apps/my-app/Program.cs', hash: 'hash2' },
        ],
        'my-lib': [
          { file: 'libs/my-lib/MyLib.csproj', hash: 'hash3' },
          { file: 'libs/my-lib/Class1.cs', hash: 'hash4' },
        ],
      };
    });

    it('should process .NET projects and return dependencies', async () => {
      mockGetProjectReferencesAsync
        .mockResolvedValueOnce(['../../libs/my-lib/MyLib.csproj']) // my-app references my-lib
        .mockResolvedValueOnce([]); // my-lib has no references

      const result = await createDependencies(mockContext, undefined);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        source: 'my-app',
        target: 'my-lib',
        type: DependencyType.static,
        sourceFile: 'apps/my-app/MyApp.csproj',
      });
      expect(mockGetProjectReferencesAsync).toHaveBeenCalledTimes(2);
    });

    it('should handle projects with no references', async () => {
      mockGetProjectReferencesAsync
        .mockResolvedValueOnce([]) // my-app has no references
        .mockResolvedValueOnce([]); // my-lib has no references

      const result = await createDependencies(mockContext, undefined);

      expect(result).toEqual([]);
      expect(mockGetProjectReferencesAsync).toHaveBeenCalledTimes(2);
    });

    it('should handle multiple project references', async () => {
      // Add another library to test context
      const updatedContext = {
        ...mockContext,
        projects: {
          ...mockContext.projects,
          'shared-lib': {
            name: 'shared-lib',
            root: 'libs/shared',
            targets: {},
          },
        },
        filesToProcess: {
          ...mockContext.filesToProcess,
          projectFileMap: {
            ...mockContext.filesToProcess.projectFileMap,
            'shared-lib': [
              { file: 'libs/shared/Shared.csproj', hash: 'hash5' },
            ],
          },
        },
      };

      mockGetProjectReferencesAsync
        .mockResolvedValueOnce([
          '../../libs/my-lib/MyLib.csproj',
          '../../libs/shared/Shared.csproj',
        ]) // my-app references both libraries
        .mockResolvedValueOnce(['../../libs/shared/Shared.csproj']) // my-lib references shared-lib
        .mockResolvedValueOnce([]); // shared-lib has no references

      const result = await createDependencies(updatedContext, undefined);

      expect(result).toHaveLength(3);

      // Check that all expected dependencies are present
      const deps = result.map((dep) => ({
        source: dep.source,
        target: dep.target,
      }));
      expect(deps).toContainEqual({ source: 'my-app', target: 'my-lib' });
      expect(deps).toContainEqual({ source: 'my-app', target: 'shared-lib' });
      expect(deps).toContainEqual({ source: 'my-lib', target: 'shared-lib' });
    });

    it('should handle mixed .NET and non-.NET projects', async () => {
      // Add a non-.NET project to test context
      const updatedContext = {
        ...mockContext,
        projects: {
          ...mockContext.projects,
          'web-frontend': {
            name: 'web-frontend',
            root: 'apps/web-frontend',
            targets: {},
          },
        },
        filesToProcess: {
          ...mockContext.filesToProcess,
          projectFileMap: {
            ...mockContext.filesToProcess.projectFileMap,
            'web-frontend': [
              { file: 'apps/web-frontend/package.json', hash: 'hash5' },
              { file: 'apps/web-frontend/angular.json', hash: 'hash6' },
            ],
          },
        },
      };

      mockGetProjectReferencesAsync
        .mockResolvedValueOnce(['../../libs/my-lib/MyLib.csproj']) // my-app references my-lib
        .mockResolvedValueOnce([]); // my-lib has no references
      // web-frontend is ignored (not a .NET project)

      const result = await createDependencies(updatedContext, undefined);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        source: 'my-app',
        target: 'my-lib',
        type: DependencyType.static,
        sourceFile: 'apps/my-app/MyApp.csproj',
      });
      // Only called for .NET projects
      expect(mockGetProjectReferencesAsync).toHaveBeenCalledTimes(2);
    });

    it('should handle different .NET project types', async () => {
      const updatedContext = {
        ...mockContext,
        projects: {
          'cs-app': { name: 'cs-app', root: 'apps/cs-app', targets: {} },
          'fs-lib': { name: 'fs-lib', root: 'libs/fs-lib', targets: {} },
          'vb-lib': { name: 'vb-lib', root: 'libs/vb-lib', targets: {} },
        },
        filesToProcess: {
          ...mockContext.filesToProcess,
          projectFileMap: {
            'cs-app': [{ file: 'apps/cs-app/CsApp.csproj', hash: 'hash1' }],
            'fs-lib': [{ file: 'libs/fs-lib/FsLib.fsproj', hash: 'hash2' }],
            'vb-lib': [{ file: 'libs/vb-lib/VbLib.vbproj', hash: 'hash3' }],
          },
        },
      };

      mockGetProjectReferencesAsync
        .mockResolvedValueOnce([
          '../../libs/fs-lib/FsLib.fsproj',
          '../../libs/vb-lib/VbLib.vbproj',
        ]) // cs-app references both
        .mockResolvedValueOnce([]) // fs-lib has no references
        .mockResolvedValueOnce([]); // vb-lib has no references

      const result = await createDependencies(updatedContext, undefined);

      expect(result).toHaveLength(2);
      expect(
        result.map((dep) => ({ source: dep.source, target: dep.target })),
      ).toContainEqual({ source: 'cs-app', target: 'fs-lib' });
      expect(
        result.map((dep) => ({ source: dep.source, target: dep.target })),
      ).toContainEqual({ source: 'cs-app', target: 'vb-lib' });
    });
  });

  describe('error handling and timeout scenarios', () => {
    beforeEach(() => {
      mockContext.filesToProcess.projectFileMap = {
        'my-app': [{ file: 'apps/my-app/MyApp.csproj', hash: 'hash1' }],
      };
    });

    it('should handle getProjectReferencesAsync errors gracefully', async () => {
      mockGetProjectReferencesAsync.mockRejectedValueOnce(
        new Error('dotnet command failed'),
      );

      const result = await createDependencies(mockContext, undefined);

      // Should return empty array instead of throwing
      expect(result).toEqual([]);
    });

    it('should handle timeout scenario', async () => {
      // Mock a long-running operation that exceeds timeout
      mockGetProjectReferencesAsync.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve([]), 35000)),
      );

      const result = await createDependencies(mockContext, undefined);

      // Should return empty array due to timeout
      expect(result).toEqual([]);
    }, 35000);

    it('should handle infinite loop scenarios on Windows', async () => {
      // Create a scenario that might cause infinite loops with multiple projects
      const complexContext = {
        ...mockContext,
        projects: {
          app1: { name: 'app1', root: 'apps/app1', targets: {} },
          app2: { name: 'app2', root: 'apps/app2', targets: {} },
          lib1: { name: 'lib1', root: 'libs/lib1', targets: {} },
        },
        filesToProcess: {
          ...mockContext.filesToProcess,
          projectFileMap: {
            app1: [{ file: 'apps/app1/App1.csproj', hash: 'hash1' }],
            app2: [{ file: 'apps/app2/App2.csproj', hash: 'hash2' }],
            lib1: [{ file: 'libs/lib1/Lib1.csproj', hash: 'hash3' }],
          },
        },
      };

      // Mock responses that complete quickly but test the timeout mechanism
      mockGetProjectReferencesAsync
        .mockResolvedValueOnce(['../../libs/lib1/Lib1.csproj'])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      const startTime = Date.now();
      const result = await createDependencies(complexContext, undefined);
      const endTime = Date.now();

      // Should complete within reasonable time
      expect(endTime - startTime).toBeLessThan(5000);
      // Should return expected dependencies
      expect(result).toHaveLength(1);
      expect(result[0].source).toBe('app1');
      expect(result[0].target).toBe('lib1');
    }, 10000);

    it('should handle mixed workspace with .NET and Angular projects without hanging', async () => {
      // Test a realistic scenario with both .NET projects and Angular projects
      const mixedContext = {
        ...mockContext,
        projects: {
          webapi: { name: 'webapi', root: 'apps/webapi', targets: {} },
          'shared-lib': {
            name: 'shared-lib',
            root: 'libs/shared-lib',
            targets: {},
          },
          'angular-app': {
            name: 'angular-app',
            root: 'apps/angular-app',
            targets: {},
          },
          'react-lib': {
            name: 'react-lib',
            root: 'libs/react-lib',
            targets: {},
          },
        },
        filesToProcess: {
          ...mockContext.filesToProcess,
          projectFileMap: {
            webapi: [{ file: 'apps/webapi/WebApi.csproj', hash: 'hash1' }],
            'shared-lib': [
              { file: 'libs/shared-lib/SharedLib.csproj', hash: 'hash2' },
            ],
            'angular-app': [
              { file: 'apps/angular-app/package.json', hash: 'hash3' },
              { file: 'apps/angular-app/angular.json', hash: 'hash4' },
            ],
            'react-lib': [
              { file: 'libs/react-lib/package.json', hash: 'hash5' },
              { file: 'libs/react-lib/tsconfig.json', hash: 'hash6' },
            ],
          },
        },
      };

      mockGetProjectReferencesAsync
        .mockResolvedValueOnce(['../../libs/shared-lib/SharedLib.csproj']) // webapi -> shared-lib
        .mockResolvedValueOnce([]); // shared-lib has no references

      const startTime = Date.now();
      const result = await createDependencies(mixedContext, undefined);
      const endTime = Date.now();

      // Should complete quickly (within 5 seconds)
      expect(endTime - startTime).toBeLessThan(5000);
      // Should only process .NET projects and return their dependencies
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        source: 'webapi',
        target: 'shared-lib',
        type: DependencyType.static,
        sourceFile: 'apps/webapi/WebApi.csproj',
      });
      // Should have been called twice (once for each .NET project)
      expect(mockGetProjectReferencesAsync).toHaveBeenCalledTimes(2);
    });

    it('should warn but continue when project reference cannot be resolved', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      mockGetProjectReferencesAsync.mockResolvedValueOnce([
        '../../non-existent/NonExistent.csproj',
      ]);

      const result = await createDependencies(mockContext, undefined);

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Unable to resolve project for reference'),
      );

      consoleSpy.mockRestore();
    });

    it('should handle malformed project reference paths', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      mockGetProjectReferencesAsync.mockResolvedValueOnce([
        'invalid-path',
        '',
        undefined as unknown as string,
      ]);

      const result = await createDependencies(mockContext, undefined);

      expect(result).toEqual([]);

      consoleSpy.mockRestore();
    });
  });

  describe('nx version compatibility', () => {
    it('should handle old signature (context only)', async () => {
      mockContext.filesToProcess.projectFileMap = {
        'my-app': [{ file: 'apps/my-app/MyApp.csproj', hash: 'hash1' }],
      };

      mockGetProjectReferencesAsync.mockResolvedValueOnce([]);

      // Call with old signature (context only)
      const result = await createDependencies(mockContext, undefined);

      expect(result).toEqual([]);
      expect(mockGetProjectReferencesAsync).toHaveBeenCalledTimes(1);
    });

    it('should handle new signature (options first, context second)', async () => {
      const options = {} as NxDotnetConfig; // NxDotnetConfig options

      mockContext.filesToProcess.projectFileMap = {
        'my-app': [{ file: 'apps/my-app/MyApp.csproj', hash: 'hash1' }],
      };

      mockGetProjectReferencesAsync.mockResolvedValueOnce([]);

      // Call with new signature (options, context)
      const result = await createDependencies(options, mockContext);

      expect(result).toEqual([]);
      expect(mockGetProjectReferencesAsync).toHaveBeenCalledTimes(1);
    });
  });

  describe('resolveReferenceToProject', () => {
    it('should find project in rootMap', () => {
      expect(
        resolveReferenceToProject(
          '../../libs/my-lib/MyLib.csproj',
          'apps/my-app/MyApp.csproj',
          {
            'libs/my-lib': 'my-lib',
            'apps/my-app': 'my-app',
          },
          {
            workspaceRoot,
          },
        ),
      ).toEqual('my-lib');
    });

    it('should handle absolute paths', () => {
      expect(
        resolveReferenceToProject(
          'libs/my-lib/MyLib.csproj',
          'apps/my-app/MyApp.csproj',
          {
            'libs/my-lib': 'my-lib',
            'apps/my-app': 'my-app',
          },
          {
            workspaceRoot,
          },
        ),
      ).toEqual('my-lib');
    });

    it('should return undefined for unresolvable references', () => {
      expect(
        resolveReferenceToProject(
          '../../non-existent/NonExistent.csproj',
          'apps/my-app/MyApp.csproj',
          {
            'libs/my-lib': 'my-lib',
            'apps/my-app': 'my-app',
          },
          {
            workspaceRoot,
          },
        ),
      ).toBeUndefined();
    });

    it('should handle Windows-style paths', () => {
      expect(
        resolveReferenceToProject(
          '..\\..\\libs\\my-lib\\MyLib.csproj',
          'apps\\my-app\\MyApp.csproj',
          {
            'libs/my-lib': 'my-lib',
            'apps/my-app': 'my-app',
          },
          {
            workspaceRoot,
          },
        ),
      ).toEqual('my-lib');
    });
  });

  describe('lazy dotnet client initialization', () => {
    const originalConsoleWarn = console.warn;

    beforeEach(() => {
      jest.clearAllMocks();
      console.warn = jest.fn();
      mockDotnetFactory.mockReturnValue({
        command: 'dotnet',
        info: { global: true, version: '6.0.100' },
      });
    });

    afterEach(() => {
      console.warn = originalConsoleWarn;
    });

    it('should not initialize dotnet client when no project files exist', async () => {
      mockContext.filesToProcess.projectFileMap = {};

      const result = await createDependencies(mockContext, undefined);

      expect(result).toEqual([]);
      expect(mockDotnetFactory).not.toHaveBeenCalled();
    });

    it('should not initialize dotnet client when no .NET project files exist', async () => {
      mockContext.filesToProcess.projectFileMap = {
        'my-project': [
          { file: 'apps/my-app/src/index.ts', hash: 'hash1' },
          { file: 'apps/my-app/package.json', hash: 'hash2' },
        ],
      };

      const result = await createDependencies(mockContext, undefined);

      expect(result).toEqual([]);
      expect(mockDotnetFactory).not.toHaveBeenCalled();
    });

    it('should initialize dotnet client lazily only when .NET projects are found', async () => {
      mockContext.filesToProcess.projectFileMap = {
        'my-project': [{ file: 'apps/my-app/MyApp.csproj', hash: 'hash1' }],
      };

      mockGetProjectReferencesAsync.mockResolvedValue([]);

      const result = await createDependencies(mockContext, undefined);

      expect(result).toEqual([]);
      expect(mockDotnetFactory).toHaveBeenCalledTimes(1);
      expect(mockDotnetFactory).toHaveBeenCalledWith();
      expect(mockDotNetClient).toHaveBeenCalledTimes(1);
      expect(mockDotNetClient).toHaveBeenCalledWith(
        expect.any(Object),
        workspaceRoot,
      );
    });

    it('should handle dotnet client initialization failure gracefully', async () => {
      mockContext.filesToProcess.projectFileMap = {
        'my-project': [{ file: 'apps/my-app/MyApp.csproj', hash: 'hash1' }],
      };

      mockDotnetFactory.mockImplementation(() => {
        throw new Error('dotnet not installed');
      });

      const result = await createDependencies(mockContext, undefined);

      expect(result).toEqual([]);
      expect(console.warn).toHaveBeenCalledWith(
        'Failed to initialize .NET client:',
        expect.any(Error),
      );
    });

    it('should handle dotnet client factory returning invalid value', async () => {
      mockContext.filesToProcess.projectFileMap = {
        'my-project': [{ file: 'apps/my-app/MyApp.csproj', hash: 'hash1' }],
      };

      // Mock DotNetClient constructor to throw an error
      mockDotNetClient.mockImplementation(() => {
        throw new Error('Invalid CLI configuration');
      });

      const result = await createDependencies(mockContext, undefined);

      expect(result).toEqual([]);
      expect(console.warn).toHaveBeenCalledWith(
        'Failed to initialize .NET client:',
        expect.any(Error),
      );
    });

    it('should reuse dotnet client instance across multiple project processing', async () => {
      mockContext.filesToProcess.projectFileMap = {
        project1: [{ file: 'apps/app1/App1.csproj', hash: 'hash1' }],
        project2: [{ file: 'apps/app2/App2.csproj', hash: 'hash2' }],
      };

      mockGetProjectReferencesAsync.mockResolvedValue([]);

      const result = await createDependencies(mockContext, undefined);

      expect(result).toEqual([]);
      // dotnetFactory should only be called once for lazy initialization
      expect(mockDotnetFactory).toHaveBeenCalledTimes(1);
      // DotNetClient constructor should only be called once
      expect(mockDotNetClient).toHaveBeenCalledTimes(1);
      // But getProjectReferencesAsync should be called for each .NET project
      expect(mockGetProjectReferencesAsync).toHaveBeenCalledTimes(2);
    });

    it('should handle null dotnet client in getProjectReferences gracefully', async () => {
      mockContext.filesToProcess.projectFileMap = {
        'my-project': [{ file: 'apps/my-app/MyApp.csproj', hash: 'hash1' }],
      };

      // Make dotnet client initialization fail
      mockDotnetFactory.mockImplementation(() => {
        throw new Error('dotnet CLI not found');
      });

      const result = await createDependencies(mockContext, undefined);

      expect(result).toEqual([]);
      expect(console.warn).toHaveBeenCalledWith(
        'Failed to initialize .NET client:',
        expect.any(Error),
      );
    });

    it('should warn when dotnet client is not initialized during reference processing', async () => {
      mockContext.filesToProcess.projectFileMap = {
        'my-project': [{ file: 'apps/my-app/MyApp.csproj', hash: 'hash1' }],
      };

      // Mock successful factory call but make client creation fail later
      mockDotnetFactory.mockReturnValue({
        command: 'dotnet',
        info: { global: true, version: '6.0.100' },
      });

      mockDotNetClient.mockImplementation(() => {
        throw new Error('Client creation failed');
      });

      const result = await createDependencies(mockContext, undefined);

      expect(result).toEqual([]);
      expect(console.warn).toHaveBeenCalledWith(
        'Failed to initialize .NET client:',
        expect.any(Error),
      );
    });
  });
});
