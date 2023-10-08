import { ExecutorContext } from '@nx/devkit';
import * as devkit from '@nx/devkit';

import * as fs from 'fs';

import { DotNetClient, mockDotnetFactory } from '@nx-dotnet/dotnet';
import * as utils from '@nx-dotnet/utils';

import executor, { SWAGGER_CLI_TOOL } from './executor';
import { UpdateSwaggerJsonExecutorSchema } from './schema';

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
    `${root}/dist/apps/${projectName}/${csProjFilePath.replace(
      'csproj',
      'dll',
    )}`,
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
      workspace: {
        version: 2,
        projects: {
          'my-app': {
            root: `${root}/apps/my-app`,
            sourceRoot: `${root}/apps/my-app`,
            targets: {
              lint: {
                executor: '@nx-dotnet/core:format',
              },
            },
          },
        },
        npmScope: 'unit-tests',
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
        if (p === `${root}/.nx-dotnet.rc.json`) {
          return {};
        }
        throw new Error(`Attempted to read unexpected file: ${p}`);
      });

    const res = await executor(options, context, dotnetClient);
    expect(
      (dotnetClient as jest.Mocked<DotNetClient>).runTool,
    ).toHaveBeenCalledWith('swagger', [
      'tofile',
      '--output',
      `${root}/libs/generated/my-app-swagger/swagger.json`,
      `${root}/dist/apps/my-app/1.dll`,
      'v1',
    ]);
    expect(dotnetClient.cwd).toEqual(`${root}/apps/my-app`);
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
        if (p === `${root}/.nx-dotnet.rc.json`) {
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
