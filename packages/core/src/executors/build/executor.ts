import { ExecutorContext } from '@nrwl/devkit';
import { BuildExecutorSchema } from './schema';
import { DotNetClient, dotnetFactory } from '../../core';
import { glob } from '../../utils';
import { dotnetBuildFlags } from '../../models';


export default async function runExecutor(
  options: BuildExecutorSchema,
  context: ExecutorContext,
  dotnetClient: DotNetClient = new DotNetClient(dotnetFactory())
) {
  const nxProjectConfiguration = context.workspace.projects[context.projectName];
  const projectFilePath = await glob(`${nxProjectConfiguration.root}/**/*.*proj`);

  if (!projectFilePath) {
    throw new Error('Unable to find a build-able project within project\'s source directory!');
  }

  dotnetClient.build(projectFilePath, Object.keys(options).map((x: dotnetBuildFlags) => ({
    flag: x,
    value: options[x]
  })));

  return {
    success: true
  };
}
