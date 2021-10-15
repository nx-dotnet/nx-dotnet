import { ExecutorContext, readJsonFile } from '@nrwl/devkit';
import { appRootPath } from '@nrwl/tao/src/utils/app-root';

import { existsSync } from 'fs';
import { join } from 'path';

import {
  DotNetClient,
  dotnetFactory,
  dotnetFormatFlags,
} from '@nx-dotnet/dotnet';
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
  const sdkVersion = dotnetClient.printSdkVersion().toString();
  const majorVersion = parseInt(sdkVersion.split('.')[0]);
  const isNet6OrHigher = majorVersion >= 6;

  const nxProjectConfiguration = getExecutedProjectConfiguration(context);
  const projectFilePath = await getProjectFileForNxProject(
    nxProjectConfiguration,
  );

  const normalized = normalizeOptions(options, isNet6OrHigher);

  ensureFormatToolInstalled(context, dotnetClient, isNet6OrHigher);
  dotnetClient.format(
    projectFilePath,
    Object.keys(normalized).map((x) => ({
      flag: x as dotnetFormatFlags,
      value: normalized[x],
    })),
  );

  return {
    success: true,
  };
}

function ensureFormatToolInstalled(
  context: ExecutorContext,
  dotnetClient: DotNetClient,
  isNet6OrHigher: boolean,
) {
  if (isNet6OrHigher) {
    // dotnet-format is already included as part of .NET SDK 6+
    return;
  }

  const manifestPath = join(appRootPath, './.config/dotnet-tools.json');
  const manifest = existsSync(manifestPath)
    ? readJsonFile(manifestPath)
    : undefined;
  if (manifest?.tools['dotnet-format']) {
    // dotnet-format is already installed.
    return;
  }

  dotnetClient.installTool('dotnet-format');
}
