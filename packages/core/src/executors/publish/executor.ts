import { ExecutorContext } from '@nrwl/devkit';

import {
  DotNetClient,
  dotnetFactory,
  dotnetPublishFlags,
} from '@nx-dotnet/dotnet';
import {
  getExecutedProjectConfiguration,
  getProjectFileForNxProject,
} from '@nx-dotnet/utils';

import { PublishExecutorSchema } from './schema';

export default async function runExecutor(
  options: PublishExecutorSchema,
  context: ExecutorContext,
  dotnetClient: DotNetClient = new DotNetClient(dotnetFactory()),
) {
  const nxProjectConfiguration = getExecutedProjectConfiguration(context);
  const projectFilePath = await getProjectFileForNxProject(
    nxProjectConfiguration,
  );

  const { publishProfile, extraParameters, ...flags } = options;

  dotnetClient.publish(
    projectFilePath,
    Object.keys(flags).map((x) => ({
      flag: x as dotnetPublishFlags,
      value: (options as Record<string, string | boolean>)[x],
    })),
    publishProfile,
    extraParameters,
  );

  return {
    success: true,
  };
}
