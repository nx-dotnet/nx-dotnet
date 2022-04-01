import { ExecutorContext } from '@nrwl/devkit';
import { workspaceRoot } from 'nx/src/utils/app-root';

import { ChildProcess } from 'child_process';
import { resolve as pathResolve } from 'path';

import { DotNetClient, dotnetFactory } from '@nx-dotnet/dotnet';
import {
  getExecutedProjectConfiguration,
  getProjectFileForNxProject,
  handleChildProcessPassthrough,
  rimraf,
} from '@nx-dotnet/utils';

import { ServeExecutorSchema } from './schema';

let childProcess: ChildProcess;
let projectDirectory: string;

export default function dotnetRunExecutor(
  options: ServeExecutorSchema,
  context: ExecutorContext,
  dotnetClient: DotNetClient = new DotNetClient(dotnetFactory()),
): Promise<{ success: boolean }> {
  const nxProjectConfiguration = getExecutedProjectConfiguration(context);
  const cwd = pathResolve(workspaceRoot, nxProjectConfiguration.root);
  dotnetClient.cwd = cwd;

  return getProjectFileForNxProject(nxProjectConfiguration).then((project) =>
    runDotnetRun(dotnetClient, pathResolve(workspaceRoot, project), options),
  );
}

const runDotnetRun = async (
  dotnetClient: DotNetClient,
  project: string,
  options: ServeExecutorSchema,
) => {
  const { watch, ...commandLineOptions } = options;

  childProcess = dotnetClient.run(project, watch, commandLineOptions);
  await handleChildProcessPassthrough(childProcess);
  await rimraf(projectDirectory + '/bin');
  await rimraf(projectDirectory + '/obj');
  return { success: true };
};
