import { ExecutorContext } from '@nrwl/devkit';

import { promises as fs } from 'fs';

import {
  DotNetClient,
  DotnetFactory,
  mockDotnetFactory,
} from '@nx-dotnet/dotnet';
import { rimraf } from '@nx-dotnet/utils';

import executor from './executor';
import { FormatExecutorSchema } from './schema';
import { assertErrorMessage } from '@nx-dotnet/utils/testing';

const options: FormatExecutorSchema = {
  check: true,
  verbosity: 'minimal',
};

const root = process.cwd() + '/tmp';

jest.mock('../../../../dotnet/src/lib/core/dotnet.client');

describe('Format Executor', () => {
  let context: ExecutorContext;
  let dotnetClient: DotNetClient;

  beforeEach(() => {
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
      },
      isVerbose: false,
    };
    dotnetClient = new DotNetClient(mockDotnetFactory());
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
      if (assertErrorMessage(e)) console.warn(e.message);
    }

    const promise = executor(options, context, dotnetClient);
    await expect(promise).rejects.toThrow(
      "More than one build-able projects are contained within the project's source directory!",
    );
  });

  it('calls format when 1 project file is found', async () => {
    try {
      const directoryPath = `${root}/apps/my-app`;
      await fs.mkdir(directoryPath, { recursive: true });
      await Promise.all([fs.writeFile(`${directoryPath}/1.csproj`, '')]);
    } catch (e) {
      if (assertErrorMessage(e)) console.warn(e.message);
    }

    const res = await executor(options, context, dotnetClient);
    expect(
      (dotnetClient as jest.Mocked<DotNetClient>).format,
    ).toHaveBeenCalled();
    expect(res.success).toBeTruthy();
  });

  it('installs dotnet-format if not already installed', async () => {
    (dotnetClient as jest.Mocked<DotNetClient>).printSdkVersion.mockReturnValue(
      Buffer.from('5.0.402'),
    );

    try {
      const directoryPath = `${root}/apps/my-app`;
      await fs.mkdir(directoryPath, { recursive: true });
      await Promise.all([fs.writeFile(`${directoryPath}/1.csproj`, '')]);

      const manifestPath = `${root}/.config`;
      await fs.mkdir(manifestPath, { recursive: true });
      await fs.writeFile(`${manifestPath}/dotnet-tools.json`, '{"tools": {}}');
    } catch (e) {
      if (assertErrorMessage(e)) console.warn(e.message);
    }

    const res = await executor(options, context, dotnetClient);
    expect(
      (dotnetClient as jest.Mocked<DotNetClient>).installTool,
    ).toHaveBeenCalled();
    expect(res.success).toBeTruthy();
  });

  it('does not install dotnet-format if already installed', async () => {
    (dotnetClient as jest.Mocked<DotNetClient>).printSdkVersion.mockReturnValue(
      Buffer.from('5.0.402'),
    );

    try {
      const directoryPath = `${root}/apps/my-app`;
      await fs.mkdir(directoryPath, { recursive: true });
      await Promise.all([fs.writeFile(`${directoryPath}/1.csproj`, '')]);

      const manifestPath = `${root}/.config`;
      await fs.mkdir(manifestPath, { recursive: true });
      await fs.writeFile(
        `${manifestPath}/dotnet-tools.json`,
        '{"tools": {"dotnet-format": {"version": "5.1.250801"}}}',
      );
    } catch (e) {
      if (assertErrorMessage(e)) console.warn(e.message);
    }

    const res = await executor(options, context, dotnetClient);
    expect(
      (dotnetClient as jest.Mocked<DotNetClient>).installTool,
    ).not.toHaveBeenCalled();
    expect(res.success).toBeTruthy();
  });

  it('does not install dotnet-format if SDK is 6+', async () => {
    (dotnetClient as jest.Mocked<DotNetClient>).printSdkVersion.mockReturnValue(
      Buffer.from('6.0.101'),
    );

    try {
      const directoryPath = `${root}/apps/my-app`;
      await fs.mkdir(directoryPath, { recursive: true });
      await Promise.all([fs.writeFile(`${directoryPath}/1.csproj`, '')]);

      const manifestPath = `${root}/.config`;
      await fs.mkdir(manifestPath, { recursive: true });
      await fs.writeFile(`${manifestPath}/dotnet-tools.json`, '{"tools": {}}');
    } catch (e) {
      if (assertErrorMessage(e)) console.warn(e.message);
    }

    const res = await executor(options, context, dotnetClient);
    expect(
      (dotnetClient as jest.Mocked<DotNetClient>).installTool,
    ).not.toHaveBeenCalled();
    expect(res.success).toBeTruthy();
  });
});
