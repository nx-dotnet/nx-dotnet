import { Tree } from '@nx/devkit';

import { DotNetClient, dotnetFactory } from '@nx-dotnet/dotnet';
import { getProjectFileForNxProject } from '@nx-dotnet/utils';

import { NxDotnetGeneratorSchema } from './schema';
import { readProjectConfiguration } from '../utils/project-configuration';
import { runDotnetAddProjectReference } from '../utils/dotnet-add';

export default async function (
  host: Tree,
  options: NxDotnetGeneratorSchema,
  client = new DotNetClient(dotnetFactory()),
) {
  const hostProject = await readProjectConfiguration(host, options.project);
  const sourceProject = await readProjectConfiguration(host, options.reference);
  let [hostProjectFile, sourceProjectFile] = ['', ''];

  try {
    [hostProjectFile, sourceProjectFile] = await Promise.all([
      getProjectFileForNxProject(hostProject, host),
      getProjectFileForNxProject(sourceProject, host),
    ]);
  } catch {
    throw new Error('Unable to find project files to add dependency!');
  }

  runDotnetAddProjectReference(
    host,
    hostProjectFile,
    sourceProjectFile,
    client,
  );
}
