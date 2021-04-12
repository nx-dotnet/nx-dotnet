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

  console.log(`Looking for project files at '${nxProjectConfiguration.root}/**/*.*proj'`)
  
  if (!projectFilePath || projectFilePath.length === 0) {
    throw new Error('Unable to find a build-able project within project\'s source directory!');
  }

  if (projectFilePath.length > 1) {
    throw new Error(`More than one build-able projects are contained within the project's source directory! \r\n ${projectFilePath}`)
  }

  dotnetClient.build(projectFilePath[0], Object.keys(options).map((x: dotnetBuildFlags) => ({
    flag: x,
    value: options[x]
  })));

  return {
    success: true
  };
}
