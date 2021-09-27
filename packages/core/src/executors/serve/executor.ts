import { ExecutorContext } from '@nrwl/devkit';
import { appRootPath } from '@nrwl/tao/src/utils/app-root';

import { ChildProcess } from 'child_process';
import { resolve as pathResolve } from 'path';

import {
  DotNetClient,
  dotnetFactory,
  dotnetRunFlags,
  dotnetRunOptions,
} from '@nx-dotnet/dotnet';
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
  const cwd = pathResolve(appRootPath, nxProjectConfiguration.root);
  dotnetClient.cwd = cwd;

  return getProjectFileForNxProject(nxProjectConfiguration).then((project) =>
    runDotnetRun(dotnetClient, pathResolve(appRootPath, project), options),
  );
}

const runDotnetRun = async (
  dotnetClient: DotNetClient,
  project: string,
  options: ServeExecutorSchema,
) => {
  const opts: dotnetRunOptions = Object.keys(options).map((x) => ({
    flag: x as dotnetRunFlags,
    value: (options as Record<string, string | boolean>)[x],
  }));

  childProcess = dotnetClient.run(project, true, opts);
  await handleChildProcessPassthrough(childProcess);
  await rimraf(projectDirectory + '/bin');
  await rimraf(projectDirectory + '/obj');
  return { success: true };
};
