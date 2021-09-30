import { ExecutorContext } from '@nrwl/devkit';

import { promises as fs } from 'fs';

import { DotNetClient, dotnetFactory } from '@nx-dotnet/dotnet';
import { rimraf } from '@nx-dotnet/utils';
import { assertErrorMessage } from '@nx-dotnet/utils/testing';

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
    dotnetClient = new DotNetClient(dotnetFactory());
  });

  afterEach(async () => {
    await rimraf(root);
  });

  it('detects no dotnet project', async () => {
    const promise = executor(options, context, dotnetClient);
    await expect(promise).rejects.toThrow(
      "Unable to find a build-able project within project's source directory!",
    );
  });

  it('detects multiple dotnet projects', async () => {
    try {
      const directoryPath = `${root}/apps/my-app`;
      await fs.mkdir(directoryPath, { recursive: true });
      await Promise.all([
        fs.writeFile(`${directoryPath}/1.csproj`, ''),
        fs.writeFile(`${directoryPath}/2.csproj`, ''),
      ]);
    } catch (e) {
      if (assertErrorMessage(e)) {
        console.warn(e.message);
      }
    }

    const promise = executor(options, context, dotnetClient);
    await expect(promise).rejects.toThrow(
      "More than one build-able projects are contained within the project's source directory!",
    );
  });

  it('calls build when 1 project file is found', async () => {
    try {
      const directoryPath = `${root}/apps/my-app`;
      await fs.mkdir(directoryPath, { recursive: true });
      await Promise.all([fs.writeFile(`${directoryPath}/1.csproj`, '')]);
    } catch (e) {
      if (assertErrorMessage(e)) {
        console.warn(e.message);
      }
    }

    const res = await executor(options, context, dotnetClient);
    expect(
      (dotnetClient as jest.Mocked<DotNetClient>).build,
    ).toHaveBeenCalled();
    expect(res.success).toBeTruthy();
  });
});
