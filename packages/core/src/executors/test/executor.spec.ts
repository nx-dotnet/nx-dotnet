import { ExecutorContext } from '@nx/devkit';

import { DotNetClient, mockDotnetFactory } from '@nx-dotnet/dotnet';
import * as utils from '@nx-dotnet/utils';

import executor from './executor';
import { TestExecutorSchema } from './schema';
import { ProjectType } from '@nx/workspace';

jest.mock('@nx-dotnet/utils', () => ({
  ...(jest.requireActual('@nx-dotnet/utils') as typeof utils),
  getProjectFileForNxProject: () => Promise.resolve('1.csproj'),
}));

const options: TestExecutorSchema = {};
const root = process.cwd() + '/tmp';

jest.mock('../../../../dotnet/src/lib/core/dotnet.client');

describe('Test Executor', () => {
  let context: ExecutorContext;
  let dotnetClient: DotNetClient;

  beforeEach(() => {
    context = {
      root: root,
      cwd: root,
      projectName: 'my-app',
      targetName: 'build',
      projectGraph: {
        nodes: {
          ['my-app']: {
            data: {
              projectType: ProjectType.Application,
              name: 'my-app',
              root: `${root}/apps/my-app`,
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

  it('runs dotnet test', async () => {
    const output = await executor(options, context, dotnetClient);
    expect(output.success).toBe(true);
    const mock = dotnetClient as jest.Mocked<DotNetClient>;
    expect(mock.test).toHaveBeenCalledTimes(1);
  });
});
