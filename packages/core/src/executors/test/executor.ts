import { ExecutorContext } from '@nrwl/devkit';
import {
  DotNetClient,
  dotnetFactory,
  dotnetTestFlags,
} from '@nx-dotnet/dotnet';
import {
  getExecutedProjectConfiguration,
  getProjectFileForNxProject,
} from '@nx-dotnet/utils';
import { TestExecutorSchema } from './schema';

export default async function runExecutor(
  options: TestExecutorSchema,
  context: ExecutorContext,
  dotnetClient: DotNetClient = new DotNetClient(dotnetFactory())
) {
  const nxProjectConfiguration = getExecutedProjectConfiguration(context);
  const projectFilePath = await getProjectFileForNxProject(
    nxProjectConfiguration
  );

  dotnetClient.test(
    projectFilePath,
    Object.keys(options).map((x) => ({
      flag: x as dotnetTestFlags,
      value: (options as Record<string, string | boolean>)[x],
    }))
  );

  return {
    success: true,
  };
}
