import { ExecutorContext } from '@nx/devkit';

import { DotNetClient, mockDotnetFactory } from '@nx-dotnet/dotnet';
import * as utils from '@nx-dotnet/utils';

import executor from './executor';
import { BuildExecutorSchema } from './schema';

jest.mock('@nx-dotnet/utils', () => ({
  ...(jest.requireActual('@nx-dotnet/utils') as typeof utils),
  getProjectFileForNxProject: () => Promise.resolve('1.csproj'),
}));

const options: BuildExecutorSchema = {
  configuration: 'Debug',
};

const root = process.cwd() + '/tmp';

jest.mock('../../../../dotnet/src/lib/core/dotnet.client');

describe('Build Executor', () => {
  let context: ExecutorContext;
  let dotnetClient: DotNetClient;

  beforeEach(async () => {
    context = {
      root: root,
      cwd: root,
      projectName: 'my-app',
      targetName: 'build',
      workspace: {
        version: 2,
        projects: {
          'my-app': {
            root: `${root}/apps/my-app`,
            sourceRoot: `${root}/apps/my-app`,
            targets: {
              build: {
                executor: '@nx-dotnet/core:build',
              },
            },
          },
        },
      },
      isVerbose: false,
    };
    dotnetClient = new DotNetClient(mockDotnetFactory());
  });

  afterEach(async () => {
    jest.resetAllMocks();
  });

  it('calls build when 1 project file is found', async () => {
    const res = await executor(options, context, dotnetClient);
    expect(
      (dotnetClient as jest.Mocked<DotNetClient>).build,
    ).toHaveBeenCalled();
    expect(res.success).toBeTruthy();
  });
});
