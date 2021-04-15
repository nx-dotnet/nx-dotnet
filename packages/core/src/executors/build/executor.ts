import { ExecutorContext } from '@nrwl/devkit';
import { BuildExecutorSchema } from './schema';
import { getExecutedProjectConfiguration, getProjectFileForNxProject } from '@nx-dotnet/utils';
import {
  dotnetBuildFlags,
  DotNetClient,
  dotnetFactory,
} from '@nx-dotnet/dotnet';

export default async function runExecutor(
  options: BuildExecutorSchema,
  context: ExecutorContext,
  dotnetClient: DotNetClient = new DotNetClient(dotnetFactory())
) {
  const nxProjectConfiguration = getExecutedProjectConfiguration(context);
  const projectFilePath = getProjectFileForNxProject(nxProjectConfiguration);  

  dotnetClient.build(
    projectFilePath[0],
    Object.keys(options).map((x: dotnetBuildFlags) => ({
      flag: x,
      value: options[x],
    }))
  );

  return {
    success: true,
  };
}
