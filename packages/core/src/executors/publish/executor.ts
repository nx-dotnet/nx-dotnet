import { ExecutorContext, workspaceRoot } from '@nx/devkit';

import { resolve } from 'path';

import { DotNetClient, dotnetFactory } from '@nx-dotnet/dotnet';
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
  const cwd = resolve(workspaceRoot, nxProjectConfiguration.root);
  dotnetClient.cwd = cwd;
  const projectFilePath = await getProjectFileForNxProject(
    nxProjectConfiguration,
  );

  options.output = options.output
    ? resolve(workspaceRoot, options.output)
    : undefined;
  const { publishProfile, extraParameters, ...flags } = options;

  dotnetClient.publish(
    resolve(workspaceRoot, projectFilePath),
    flags,
    publishProfile,
    extraParameters,
  );

  return {
    success: true,
  };
}
