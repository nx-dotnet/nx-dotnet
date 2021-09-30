import {
  ExecutorContext,
  joinPathFragments,
  normalizePath,
} from '@nrwl/devkit';

import { promises as fs } from 'fs';

import { DotNetClient, dotnetFactory } from '@nx-dotnet/dotnet';
import { rimraf } from '@nx-dotnet/utils';

import executor from './executor';
import { PublishExecutorSchema } from './schema';
import { isAbsolute } from 'path';
import { assertErrorMessage } from '@nx-dotnet/utils/testing';

const options: PublishExecutorSchema = {
  configuration: 'Debug',
  output: 'dist/hello-world',
};

const root = process.cwd() + '/tmp';

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
      },
      isVerbose: false,
    };
    dotnetClient = new DotNetClient(
      dotnetFactory(),
    ) as jest.Mocked<DotNetClient>;
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

  it('calls publish when 1 project file is found', async () => {
    try {
      const directoryPath = `${root}/apps/my-app`;
      await fs.mkdir(directoryPath, { recursive: true });
      await Promise.all([fs.writeFile(`${directoryPath}/1.csproj`, '')]);
    } catch (e) {
      if (assertErrorMessage(e)) console.warn(e.message);
    }

    const res = await executor(options, context, dotnetClient);
    expect(dotnetClient.publish).toHaveBeenCalled();
    expect(res.success).toBeTruthy();
  });

  it('should pass path relative to project root, not workspace root', async () => {
    const directoryPath = joinPathFragments(root, './apps/my-app');
    try {
      await fs.mkdir(directoryPath, { recursive: true });
      await Promise.all([fs.writeFile(`${directoryPath}/1.csproj`, '')]);
    } catch (e) {
      if (assertErrorMessage(e)) console.warn(e.message);
    }
    const res = await executor(options, context, dotnetClient);
    expect(dotnetClient.publish).toHaveBeenCalled();
    expect(normalizePath(dotnetClient.cwd || '')).toEqual(directoryPath);
    expect(res.success).toBeTruthy();
  });

  it('passes an absolute output path', async () => {
    const spy = jest.spyOn(dotnetClient, 'publish');
    const directoryPath = joinPathFragments(root, './apps/my-app');
    try {
      await fs.mkdir(directoryPath, { recursive: true });
      await Promise.all([fs.writeFile(`${directoryPath}/1.csproj`, '')]);
    } catch (e) {
      if (assertErrorMessage(e)) console.warn(e.message);
    }
    const res = await executor(options, context, dotnetClient);
    expect(spy).toHaveBeenCalled();
    const outputFlag = spy.mock.calls[0][1]?.find((x) => x.flag === 'output');
    expect(outputFlag).toBeTruthy();
    expect(outputFlag && isAbsolute(outputFlag.value as string)).toBeTruthy();
    expect(res.success).toBeTruthy();
  });
});
