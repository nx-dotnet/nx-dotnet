import { ExecutorContext, readJsonFile } from '@nrwl/devkit';
import { appRootPath } from '@nrwl/tao/src/utils/app-root';

import { existsSync } from 'fs';
import { join } from 'path';

import { DotNetClient, dotnetFactory } from '@nx-dotnet/dotnet';
import {
  getExecutedProjectConfiguration,
  getProjectFileForNxProject,
} from '@nx-dotnet/utils';

import { FormatExecutorSchema } from './schema';

function normalizeOptions(
  options: FormatExecutorSchema,
  isNet6OrHigher: boolean,
): Record<string, string | boolean | undefined> {
  const { diagnostics, include, exclude, check, fix, ...flags } = options;
  return {
    ...flags,
    diagnostics: Array.isArray(diagnostics)
      ? diagnostics.join(' ')
      : diagnostics,
    include: Array.isArray(include) ? include.join(' ') : include,
    exclude: Array.isArray(exclude) ? exclude.join(' ') : exclude,
    check: fix ? false : check && !isNet6OrHigher, // The --check flag is for .NET 5 and older
    verifyNoChanges: fix ? false : check && isNet6OrHigher, // The --verify-no-changes flag is for .NET 6 and newer
  };
}

export default async function runExecutor(
  options: FormatExecutorSchema,
  context: ExecutorContext,
  dotnetClient: DotNetClient = new DotNetClient(dotnetFactory()),
) {
  const sdkVersion = dotnetClient.getSdkVersion();
  const majorVersion = parseInt(sdkVersion.split('.')[0]);
  const isNet6OrHigher = majorVersion >= 6;

  const nxProjectConfiguration = getExecutedProjectConfiguration(context);
  const projectFilePath = await getProjectFileForNxProject(
    nxProjectConfiguration,
  );

  const normalized = normalizeOptions(options, isNet6OrHigher);

  ensureFormatToolInstalled(context, dotnetClient, majorVersion);
  dotnetClient.format(projectFilePath, normalized, isNet6OrHigher);

  return {
    success: true,
  };
}

function ensureFormatToolInstalled(
  context: ExecutorContext,
  dotnetClient: DotNetClient,
  majorVersion: number,
) {
  // Currently the built-in .NET Format executor is broken on .NET 6
  // Fall back to installing and using the tool directly
  // eslint-disable-next-line no-constant-condition
  if (false && majorVersion >= 6) {
    // dotnet-format is already included as part of .NET SDK 6+
    return;
  }

  const manifestPath = join(appRootPath, './.config/dotnet-tools.json');
  console.log(manifestPath);
  const manifest = existsSync(manifestPath)
    ? readJsonFile(manifestPath)
    : undefined;
  if (manifest?.tools['dotnet-format']) {
    // dotnet-format is already installed.
    return;
  }

  if (majorVersion === 6) {
    dotnetClient.installTool(
      'dotnet-format',
      '6.*',
      'https://pkgs.dev.azure.com/dnceng/public/_packaging/dotnet6/nuget/v3/index.json',
    );
  } else if (majorVersion === 7) {
    dotnetClient.installTool(
      'dotnet-format',
      '7.*',
      'https://pkgs.dev.azure.com/dnceng/public/_packaging/dotnet7/nuget/v3/index.json',
    );
  } else {
    dotnetClient.installTool('dotnet-format');
  }
}
