import { ExecutorContext } from '@nrwl/devkit';
import * as devkit from '@nrwl/devkit';

import * as fs from 'fs';

import { DotNetClient, mockDotnetFactory } from '@nx-dotnet/dotnet';
import * as utils from '@nx-dotnet/utils';

import executor, { SWAGGER_CLI_TOOL } from './executor';
import { UpdateSwaggerJsonExecutorSchema } from './schema';

jest.mock('@nx-dotnet/utils', () => ({
  ...(jest.requireActual('@nx-dotnet/utils') as typeof utils),
  getProjectFileForNxProject: () => Promise.resolve('1.csproj'),
}));

const mockCSProj = `<Project>
<ItemGroup>
  <PackageReference Include="Swashbuckle.AspNetCore" Version="99.99.99"></PackageReference>
</ItemGroup>
</Project>`;

const options: UpdateSwaggerJsonExecutorSchema = {
  output: '',
  startupAssembly: '',
  swaggerDoc: '',
  skipInstall: false,
};

const root = '/virtual';
jest.mock('@nrwl/devkit', () => ({
  ...jest.requireActual('@nrwl/devkit'),
  appRootPath: '/virtual',
  workspaceRoot: '/virtual',
}));

jest.mock('../../../../dotnet/src/lib/core/dotnet.client');

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
      .spyOn(devkit, 'readJsonFile')
      .mockImplementation((p: string): object => {
        if (p === `${root}/.nx-dotnet.rc.json`) {
          return {};
        } else if (p === `${root}/.config/dotnet-tools.json`) {
          return { tools: { [SWAGGER_CLI_TOOL]: '99.99.99' } };
        }
        throw new Error(`Attempted to read unexpected file: ${p}`);
      });

    const res = await executor(options, context, dotnetClient);
    expect(
      (dotnetClient as jest.Mocked<DotNetClient>).runTool,
    ).toHaveBeenCalled();
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
      .spyOn(devkit, 'readJsonFile')
      .mockImplementation((p: string): object => {
        if (p === `${root}/.nx-dotnet.rc.json`) {
          return {};
        } else if (p === `${root}/.config/dotnet-tools.json`) {
          return { tools: { [SWAGGER_CLI_TOOL]: '99.99.99' } };
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
    jest.spyOn(devkit, 'readJsonFile').mockReturnValue({});
    const res = await executor(
      { ...options, skipInstall: true },
      context,
      dotnetClient,
    );
    expect(
      (dotnetClient as jest.Mocked<DotNetClient>).installTool,
    ).not.toHaveBeenCalled();
    expect(res.success).toBeTruthy();
  });
});
