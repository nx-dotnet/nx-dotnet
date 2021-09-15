import { ExecutorContext } from '@nrwl/devkit';
import { appRootPath } from '@nrwl/tao/src/utils/app-root';

import {
  DotNetClient,
  dotnetFactory,
  dotnetPublishFlags,
} from '@nx-dotnet/dotnet';
import {
  getExecutedProjectConfiguration,
  getProjectFileForNxProject,
} from '@nx-dotnet/utils';
import { resolve } from 'path';

import { PublishExecutorSchema } from './schema';

export default async function runExecutor(
  options: PublishExecutorSchema,
  context: ExecutorContext,
  dotnetClient: DotNetClient = new DotNetClient(dotnetFactory()),
) {
  const nxProjectConfiguration = getExecutedProjectConfiguration(context);
  const cwd = resolve(appRootPath, nxProjectConfiguration.root);
  dotnetClient.cwd = cwd;
  const projectFilePath = await getProjectFileForNxProject(
    nxProjectConfiguration,
  );

  options.output = options.output
    ? resolve(appRootPath, options.output)
    : undefined;
  const { publishProfile, extraParameters, ...flags } = options;

  dotnetClient.publish(
    resolve(appRootPath, projectFilePath),
    Object.keys(flags).map((x) => ({
      flag: x as dotnetPublishFlags,
      value: options[x as keyof PublishExecutorSchema],
    })),
    publishProfile,
    extraParameters,
  );

  return {
    success: true,
  };
}
