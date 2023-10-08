import { ExecutorContext } from '@nx/devkit';

import { DotNetClient, mockDotnetFactory } from '@nx-dotnet/dotnet';
import * as utils from '@nx-dotnet/utils';

import executor from './executor';
import { FormatExecutorSchema } from './schema';

jest.mock('@nx-dotnet/utils', () => ({
  ...(jest.requireActual('@nx-dotnet/utils') as typeof utils),
  getProjectFileForNxProject: () => Promise.resolve('1.csproj'),
}));

const options: FormatExecutorSchema = {
  check: true,
  verbosity: 'minimal',
};

const root = process.cwd() + '/tmp';

jest.mock('../../../../dotnet/src/lib/core/dotnet.client');

describe('Format Executor', () => {
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

  it('calls format when 1 project file is found', async () => {
    const res = await executor(options, context, dotnetClient);
    expect(
      (dotnetClient as jest.Mocked<DotNetClient>).format,
    ).toHaveBeenCalled();
    expect(res.success).toBeTruthy();
  });

  it('installs dotnet-format if not already installed', async () => {
    jest
      .spyOn(utils, 'readInstalledDotnetToolVersion')
      .mockReturnValue(undefined);
    const res = await executor(options, context, dotnetClient);
    expect(
      (dotnetClient as jest.Mocked<DotNetClient>).installTool,
    ).toHaveBeenCalled();
    expect(res.success).toBeTruthy();
  });

  it('does not install dotnet-format if already installed', async () => {
    jest
      .spyOn(utils, 'readInstalledDotnetToolVersion')
      .mockReturnValue('1.0.0');
    const res = await executor(options, context, dotnetClient);
    expect(
      (dotnetClient as jest.Mocked<DotNetClient>).installTool,
    ).not.toHaveBeenCalled();
    expect(res.success).toBeTruthy();
  });

  it('does not install dotnet-format if SDK is 6+', async () => {
    (dotnetClient as jest.Mocked<DotNetClient>).getSdkVersion.mockReturnValue(
      '6.0.101',
    );

    const res = await executor(options, context, dotnetClient);
    expect(
      (dotnetClient as jest.Mocked<DotNetClient>).installTool,
    ).not.toHaveBeenCalled();
    expect(res.success).toBeTruthy();
  });

  it('passes the --check option on .NET 5 and earlier', async () => {
    (dotnetClient as jest.Mocked<DotNetClient>).getSdkVersion.mockReturnValue(
      '5.0.101',
    );
    jest
      .spyOn(utils, 'readInstalledDotnetToolVersion')
      .mockReturnValue('1.0.0');
    const res = await executor(options, context, dotnetClient);
    expect(res.success).toBeTruthy();

    const formatOptions = (dotnetClient as jest.Mocked<DotNetClient>).format
      .mock.calls[0][1];
    const checkFlag = formatOptions?.check;
    expect(checkFlag).toBeTruthy();
  });

  it('passes the --verify-no-changes option on .NET 6 and later', async () => {
    (dotnetClient as jest.Mocked<DotNetClient>).getSdkVersion.mockReturnValue(
      '6.0.101',
    );

    const res = await executor(options, context, dotnetClient);
    expect(res.success).toBeTruthy();

    const formatOptions = (dotnetClient as jest.Mocked<DotNetClient>).format
      .mock.calls[0][1];
    const verifyNoChangesFlag = formatOptions?.verifyNoChanges;
    expect(verifyNoChangesFlag).toBeTruthy();
  });
});
