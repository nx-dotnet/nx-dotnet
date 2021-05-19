import { ExecutorContext } from '@nrwl/devkit';
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
): Record<string, string | boolean | undefined> {
  const { diagnostics, include, exclude, check, fix, ...flags } = options;
  return {
    ...flags,
    diagnostics: Array.isArray(diagnostics)
      ? diagnostics.join(' ')
      : diagnostics,
    include: Array.isArray(include) ? include.join(' ') : include,
    exclude: Array.isArray(exclude) ? exclude.join(' ') : exclude,
    check: fix ? false : check,
  };
}

export default async function runExecutor(
  options: FormatExecutorSchema,
  context: ExecutorContext,
  dotnetClient: DotNetClient = new DotNetClient(dotnetFactory()),
) {
  const nxProjectConfiguration = getExecutedProjectConfiguration(context);
  const projectFilePath = await getProjectFileForNxProject(
    nxProjectConfiguration,
  );

  const normalized = normalizeOptions(options);

  dotnetClient.installTool('dotnet-format');
  dotnetClient.format(
    projectFilePath,
    Object.keys(options).map((x) => ({
      flag: x as dotnetFormatFlags,
      value: normalized[x],
    })),
  );

  return {
    success: true,
  };
}
