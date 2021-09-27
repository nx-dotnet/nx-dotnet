import { ExecutorContext } from '@nrwl/devkit';

import { mkdirSync, writeFileSync } from 'fs';

import { DotNetClient, mockDotnetFactory } from '@nx-dotnet/dotnet';
import { rimraf } from '@nx-dotnet/utils';

import executor from './executor';
import { TestExecutorSchema } from './schema';

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
    await rimraf(root);
  });

  it('runs dotnet test', async () => {
    const srcRoot = context.workspace.projects['my-app'].sourceRoot as string;
    mkdirSync(srcRoot, { recursive: true });
    writeFileSync(srcRoot + '/test.csproj', '');
    const output = await executor(options, context, dotnetClient);
    expect(output.success).toBe(true);
    const mock = dotnetClient as jest.Mocked<DotNetClient>;
    expect(mock.test).toHaveBeenCalledTimes(1);
  });
});
