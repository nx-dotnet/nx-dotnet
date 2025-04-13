import { ExecutorContext } from '@nx/devkit';
import * as devkit from '@nx/devkit';

import * as fs from 'fs';
import { join, normalize, sep } from 'path';

import { DotNetClient, mockDotnetFactory } from '@nx-dotnet/dotnet';
import * as utils from '@nx-dotnet/utils';

import executor, { SWAGGER_CLI_TOOL } from './executor';
import { UpdateSwaggerJsonExecutorSchema } from './schema';
import { ProjectType } from '@nx/workspace';

jest.mock('fs');

jest.mock('@nx-dotnet/utils', () => ({
  ...(jest.requireActual('@nx-dotnet/utils') as typeof utils),
  getProjectFileForNxProject: () => Promise.resolve('1.csproj'),
}));

const mockCSProj = `<Project>
<ItemGroup>
  <PackageReference Include="Swashbuckle.AspNetCore" Version="99.99.99"></PackageReference>
</ItemGroup>
</Project>`;

const options: Partial<UpdateSwaggerJsonExecutorSchema> = {
  output: 'libs/generated/my-app-swagger/swagger.json',
};

const root = '/virtual';
jest.mock('@nx/devkit', () => ({
  ...jest.requireActual('@nx/devkit'),
  appRootPath: '/virtual',
  workspaceRoot: '/virtual',
}));

jest.mock('../../../../dotnet/src/lib/core/dotnet.client');

jest.mock('../../generators/utils/get-path-to-startup-assembly', () => ({
  buildStartupAssemblyPath: (
    projectName: string,
    _project: devkit.ProjectConfiguration,
    csProjFilePath: string,
  ) =>
    join(
      root,
      'dist/apps',
      projectName,
      csProjFilePath.replace('csproj', 'dll'),
    ),
}));

describe('Update-Swagger Executor', () => {
  let context: ExecutorContext;
  let dotnetClient: DotNetClient;

  beforeEach(async () => {
    context = {
      root: root,
      cwd: root,
      projectName: 'my-app',
      targetName: 'lint',
      projectGraph: {
        nodes: {
          ['my-app']: {
            data: {
              projectType: ProjectType.Application,
              name: 'my-app',
              root: join(root, 'apps/my-app'),
            },
            type: 'app',
            name: 'my-app',
          },
        },
        dependencies: {},
      },
      nxJsonConfiguration: {},
      projectsConfigurations: {
        version: 2,
        projects: {
          'my-app': {
            root: join(root, 'apps/my-app'),
            sourceRoot: join(root, 'apps/my-app'),
            targets: {
              lint: {
                executor: '@nx-dotnet/core:format',
              },
            },
          },
        },
      },
      isVerbose: false,
    };
    dotnetClient = new DotNetClient(mockDotnetFactory());
    (dotnetClient as jest.Mocked<DotNetClient>).getSdkVersion.mockReturnValue(
      '5.0.402',
    );
  });

  it('calls run-tool when 1 project file is found', async () => {
    jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    jest.spyOn(fs, 'readFileSync').mockImplementation((p): string => {
      if (p === '1.csproj') {
        return mockCSProj;
      }
      throw new Error('Attempted to read unexpected file');
    });
    jest
      .spyOn(utils, 'readInstalledDotnetToolVersion')
      .mockImplementation((tool) => {
        if (tool === SWAGGER_CLI_TOOL) {
          return '99.99.99';
        }
        throw new Error('unknown tool version read');
      });
    jest
      .spyOn(devkit, 'readJsonFile')
      .mockImplementation((p: string): object => {
        if (p === join(root, '.nx-dotnet.rc.json')) {
          return {};
        }
        throw new Error(`Attempted to read unexpected file: ${p}`);
      });

    const res = await executor(options, context, dotnetClient);

    // First verify that runTool was called
    const runToolMock = (dotnetClient as jest.Mocked<DotNetClient>).runTool;
    expect(runToolMock).toHaveBeenCalled();

    // Get the mock calls and verify we have at least one
    const mockCalls = runToolMock.mock.calls;
    expect(mockCalls.length).toBeGreaterThan(0);

    // Types safety - add a guard clause to make TypeScript happy
    if (mockCalls.length === 0) {
      throw new Error('runTool was not called');
    }

    // Verify the first argument is 'swagger'
    expect(mockCalls[0][0]).toBe('swagger');

    // Get the arguments array
    const callArgs = mockCalls[0][1];

    // Check if callArgs is defined
    if (!callArgs) {
      throw new Error('Expected callArgs to be defined');
    }

    // Now check the arguments array
    expect(Array.isArray(callArgs)).toBe(true);
    expect(callArgs.length).toBeGreaterThanOrEqual(5);

    // Verify individual arguments
    expect(callArgs[0]).toBe('tofile');
    expect(callArgs[1]).toBe('--output');

    // Create platform-independent path segments for comparison
    const expectedOutputPath = normalize(
      'libs/generated/my-app-swagger/swagger.json',
    );
    const expectedDllPath = normalize('dist/apps/my-app/1.dll');

    // Normalize the paths to handle different path separators
    const normalizedOutputPath = normalize(callArgs[2]);
    const normalizedDllPath = normalize(callArgs[3]);

    // Check that paths end with the expected segments
    expect(normalizedOutputPath.includes(expectedOutputPath)).toBeTruthy();
    expect(normalizedDllPath.includes(expectedDllPath)).toBeTruthy();
    expect(callArgs[4]).toBe('v1');

    // Compare paths in a platform-independent way
    const expectedCwd = normalize(join(root, 'apps/my-app'));
    if (dotnetClient.cwd) {
      // Extract the path part after the root path
      const actualPath = normalize(dotnetClient.cwd);

      // Verify that the path ends with the expected path segment
      expect(
        actualPath.endsWith('apps\\my-app') ||
          actualPath.endsWith('apps/my-app'),
      ).toBeTruthy();
    }

    expect(res.success).toBeTruthy();
  });

  it(`installs ${SWAGGER_CLI_TOOL} if not already installed`, async () => {
    jest.spyOn(fs, 'existsSync').mockReturnValue(false);
    jest.spyOn(fs, 'readFileSync').mockImplementation((p): string => {
      if (p === '1.csproj') {
        return mockCSProj;
      }
      throw new Error('Attempted to read unexpected file');
    });
    jest.spyOn(devkit, 'readJsonFile').mockReturnValue({});
    jest
      .spyOn(utils, 'readInstalledDotnetToolVersion')
      .mockImplementation((tool) => {
        if (tool === SWAGGER_CLI_TOOL) {
          return undefined;
        }
        throw new Error('unknown tool version read');
      });
    const res = await executor(options, context, dotnetClient);
    expect(
      (dotnetClient as jest.Mocked<DotNetClient>).installTool,
    ).toHaveBeenCalledWith(SWAGGER_CLI_TOOL, '99.99.99');
    expect(res.success).toBeTruthy();
  });

  it(`doesn't install ${SWAGGER_CLI_TOOL} if already installed`, async () => {
    jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    jest.spyOn(fs, 'readFileSync').mockImplementation((p): string => {
      if (p === '1.csproj') {
        return mockCSProj;
      }
      throw new Error('Attempted to read unexpected file');
    });
    jest
      .spyOn(utils, 'readInstalledDotnetToolVersion')
      .mockImplementation((tool) => {
        if (tool === SWAGGER_CLI_TOOL) {
          return '99.99.99';
        }
        throw new Error('unknown tool version read');
      });
    jest
      .spyOn(devkit, 'readJsonFile')
      .mockImplementation((p: string): object => {
        if (p === join(root, '.nx-dotnet.rc.json')) {
          return {};
        }
        throw new Error(`Attempted to read unexpected file: ${p}`);
      });

    const res = await executor(options, context, dotnetClient);
    expect(
      (dotnetClient as jest.Mocked<DotNetClient>).installTool,
    ).not.toHaveBeenCalled();
    expect(res.success).toBeTruthy();
  });

  it(`skips installation when skipInstall is true`, async () => {
    jest.spyOn(fs, 'existsSync').mockReturnValue(false);
    jest.spyOn(fs, 'readFileSync').mockImplementation((p): string => {
      if (p === '1.csproj') {
        return mockCSProj;
      }
      throw new Error('Attempted to read unexpected file');
    });
    const readToolVersionSpy = jest
      .spyOn(utils, 'readInstalledDotnetToolVersion')
      .mockReset();

    jest.spyOn(devkit, 'readJsonFile').mockReturnValue({});
    const res = await executor(
      { ...options, skipInstall: true },
      context,
      dotnetClient,
    );
    expect(
      (dotnetClient as jest.Mocked<DotNetClient>).installTool,
    ).not.toHaveBeenCalled();
    expect(readToolVersionSpy).not.toBeCalled();
    expect(res.success).toBeTruthy();
  });
});
