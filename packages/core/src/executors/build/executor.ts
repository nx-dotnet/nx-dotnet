import {
  ExecutorContext,
  ProjectConfiguration,
  workspaceRoot,
} from '@nx/devkit';

import { rmSync, statSync } from 'fs';
import { join, resolve } from 'path';

import { DotNetClient, dotnetFactory } from '@nx-dotnet/dotnet';
import {
  getExecutedProjectConfiguration,
  getProjectFileForNxProject,
  inlineNxTokens,
} from '@nx-dotnet/utils';

import { BuildExecutorSchema } from './schema';

export default async function runExecutor(
  options: BuildExecutorSchema,
  context: ExecutorContext,
  dotnetClient: DotNetClient = new DotNetClient(dotnetFactory()),
) {
  const nxProjectConfiguration = getExecutedProjectConfiguration(context);
  removeOldArtifacts(context, nxProjectConfiguration);

  dotnetClient.cwd = resolve(workspaceRoot, nxProjectConfiguration.root);
  dotnetClient.printSdkVersion();
  const projectFilePath = resolve(
    workspaceRoot,
    await getProjectFileForNxProject(nxProjectConfiguration),
  );

  const { extraParameters, ...flags } = options;

  options.output = options.output
    ? resolve(workspaceRoot, options.output)
    : undefined;

  dotnetClient.build(projectFilePath, flags, extraParameters);

  return {
    success: true,
  };
}

function removeOldArtifacts(
  context: ExecutorContext,
  projectConfiguration: ProjectConfiguration,
) {
  const outputs = context.target?.outputs?.map((output) =>
    join(context.root, inlineNxTokens(output, projectConfiguration)),
  );
  if (
    !outputs &&
    Object.values(context.nxJsonConfiguration?.tasksRunnerOptions ?? {}).some(
      (runnerOptions) =>
        runnerOptions.options?.cacheableOperations?.includes(
          context.targetName,
        ),
    )
  ) {
    throw new Error(`[nx-dotnet] ${context.projectGraph}:${context.targetName} is cacheable, but has no outputs listed. 

This will result in cache hits not retrieving build artifacts, only terminal outputs.

See: https://nx.dev/reference/project-configuration#outputs`);
  }
  for (const output of outputs || []) {
    if (
      // No reason to clear build intermediates, just makes the resulting build command slower.
      !output.includes('intermediates') &&
      !output.endsWith('obj') &&
      // Prevent exceptions from trying to rmdirSync(globPattern)
      getStatsOrNull(output)?.isDirectory()
    ) {
      rmSync(output, { recursive: true });
    }
  }
}

function getStatsOrNull(f: string) {
  try {
    return statSync(f);
  } catch {
    return null;
  }
}
