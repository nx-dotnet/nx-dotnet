import { ExecutorContext, joinPathFragments, normalizePath } from '@nx/devkit';

import { isAbsolute } from 'path';

import { DotNetClient, mockDotnetFactory } from '@nx-dotnet/dotnet';
import * as utils from '@nx-dotnet/utils';

import executor from './executor';
import { PublishExecutorSchema } from './schema';

jest.mock('@nx-dotnet/utils', () => ({
  ...(jest.requireActual('@nx-dotnet/utils') as typeof utils),
  getProjectFileForNxProject: () => Promise.resolve('1.csproj'),
}));

const options: PublishExecutorSchema = {
  configuration: 'Debug',
  output: 'dist/hello-world',
};

const root = process.cwd() + '/tmp';

jest.mock('../../../../dotnet/src/lib/core/dotnet.client');

describe('Publish Executor', () => {
  let context: ExecutorContext;
  let dotnetClient: jest.Mocked<DotNetClient>;

  beforeEach(() => {
    context = {
      root: root,
      cwd: root,
      projectName: 'my-app',
      targetName: 'publish',
      workspace: {
        version: 2,
        projects: {
          'my-app': {
            root: `${root}/apps/my-app`,
            sourceRoot: `${root}/apps/my-app`,
            targets: {
              publish: {
                executor: '@nx-dotnet/core:publish',
              },
            },
          },
        },
        npmScope: 'unit-tests',
      },
      isVerbose: false,
    };
    dotnetClient = new DotNetClient(
      mockDotnetFactory(),
    ) as jest.Mocked<DotNetClient>;
  });

  it('calls publish when 1 project file is found', async () => {
    const res = await executor(options, context, dotnetClient);
    expect(dotnetClient.publish).toHaveBeenCalled();
    expect(res.success).toBeTruthy();
  });

  it('should pass path relative to project root, not workspace root', async () => {
    const directoryPath = joinPathFragments(root, './apps/my-app');
    const res = await executor(options, context, dotnetClient);
    expect(dotnetClient.publish).toHaveBeenCalled();
    expect(normalizePath(dotnetClient.cwd || '')).toEqual(directoryPath);
    expect(res.success).toBeTruthy();
  });

  it('passes an absolute output path', async () => {
    const spy = jest.spyOn(dotnetClient, 'publish');
    const res = await executor(options, context, dotnetClient);
    expect(spy).toHaveBeenCalled();
    const outputFlag = spy.mock.calls[0][1]?.output;
    expect(outputFlag).toBeTruthy();
    expect(outputFlag && isAbsolute(outputFlag as string)).toBeTruthy();
    expect(res.success).toBeTruthy();
  });
});
