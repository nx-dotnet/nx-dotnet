import { ExecutorContext } from '@nrwl/devkit';

import {
  dotnetBuildFlags,
  DotNetClient,
  dotnetFactory,
} from '@nx-dotnet/dotnet';
import {
  getExecutedProjectConfiguration,
  getProjectFileForNxProject,
} from '@nx-dotnet/utils';

import { BuildExecutorSchema } from './schema';

export default async function runExecutor(
  options: BuildExecutorSchema,
  context: ExecutorContext,
  dotnetClient: DotNetClient = new DotNetClient(dotnetFactory())
) {
  const nxProjectConfiguration = getExecutedProjectConfiguration(context);
  const projectFilePath = await getProjectFileForNxProject(
    nxProjectConfiguration
  );

  dotnetClient.build(
    projectFilePath,
    Object.keys(options).map((x) => ({
      flag: x as dotnetBuildFlags,
      value: (options as Record<string, string | boolean>)[x],
    }))
  );

  return {
    success: true,
  };
}
