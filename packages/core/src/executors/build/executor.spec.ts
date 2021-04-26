import { ExecutorContext } from '@nrwl/devkit';

import { promises as fs } from 'fs';

import { DotNetClient, mockDotnetFactory } from '@nx-dotnet/dotnet';
import { rimraf } from '@nx-dotnet/utils';

import executor from './executor';
import { BuildExecutorSchema } from './schema';

const options: BuildExecutorSchema = {
  configuration: 'Debug',
};

const root = process.cwd() + '/tmp';

describe('Build Executor', () => {
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

  afterEach(() => {
    return rimraf(root);
  });

  it('detects no dotnet project', async () => {
    expect.assertions(1);
    try {
      await executor(options, context, dotnetClient);
    } catch (e) {
      console.log(e.message);
      expect(e.message).toMatch(
        "Unable to find a build-able project within project's source directory!"
      );
    }
  });

  it('detects multiple dotnet projects', async () => {
    expect.assertions(1);

    try {
      const directoryPath = `${root}/apps/my-app`;
      await fs.mkdir(directoryPath, { recursive: true });
      await Promise.all([
        fs.writeFile(`${directoryPath}/1.csproj`, ''),
        fs.writeFile(`${directoryPath}/2.csproj`, ''),
      ]);
    } catch (e) {
      console.warn(e.message);
    }

    try {
      await executor(options, context, dotnetClient);
    } catch (e) {
      console.log(e.message);
      expect(e.message).toMatch(
        "More than one build-able projects are contained within the project's source directory!"
      );
    }
  });

  it('calls build when 1 project file is found', async () => {
    try {
      const directoryPath = `${root}/apps/my-app`;
      await fs.mkdir(directoryPath, { recursive: true });
      await Promise.all([fs.writeFile(`${directoryPath}/1.csproj`, '')]);
    } catch (e) {
      console.warn(e.message);
    }

    const res = await executor(options, context, dotnetClient);
    expect(res.success).toBeTruthy();
  });
});
