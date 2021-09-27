import { ExecutorContext } from '@nrwl/devkit';
import { appRootPath } from '@nrwl/tao/src/utils/app-root';

import { resolve } from 'path';

import {
  DotNetClient,
  dotnetFactory,
  dotnetTestFlags,
} from '@nx-dotnet/dotnet';
import {
  getExecutedProjectConfiguration,
  getProjectFileForNxProject,
  handleChildProcessPassthrough,
  isChildProcess,
  rimraf,
} from '@nx-dotnet/utils';

import { TestExecutorSchema } from './schema';

let projectDirectory: string;

export default async function runExecutor(
  options: TestExecutorSchema,
  context: ExecutorContext,
  dotnetClient: DotNetClient = new DotNetClient(dotnetFactory()),
): Promise<{ success: boolean }> {
  const nxProjectConfiguration = getExecutedProjectConfiguration(context);
  projectDirectory = resolve(appRootPath, nxProjectConfiguration.root);
  const projectFilePath = await getProjectFileForNxProject(
    nxProjectConfiguration,
  );
  dotnetClient.cwd = projectDirectory;
  const { watch, ...parsedOptions } = options;

  const result = dotnetClient.test(
    resolve(appRootPath, projectFilePath),
    watch,
    Object.keys(options).map((x) => ({
      flag: x as dotnetTestFlags,
      value: (parsedOptions as Record<string, string | boolean>)[x],
    })),
  );

  if (watch && isChildProcess(result)) {
    await handleChildProcessPassthrough(result);
    await rimraf(projectDirectory + '/bin');
    await rimraf(projectDirectory + '/obj');
  }
  return {
    success: true,
  };
}
