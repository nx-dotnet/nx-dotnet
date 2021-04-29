import { readProjectConfiguration, Tree } from '@nrwl/devkit';

import {
  dotnetAddPackageFlags,
  DotNetClient,
  dotnetFactory,
} from '@nx-dotnet/dotnet';
import { getProjectFileForNxProject } from '@nx-dotnet/utils';

import { NugetReferenceGeneratorSchema } from './schema';

export default async function (
  host: Tree,
  options: NugetReferenceGeneratorSchema,
  dotnetClient = new DotNetClient(dotnetFactory())
) {
  const project = readProjectConfiguration(host, options.project);
  const projectFilePath = await getProjectFileForNxProject(project);

  dotnetClient.addPackageReference(
    projectFilePath,
    options.packageName,
    Object.keys(options)
      .filter((x) => x !== 'packageName' && x !== 'project')
      .map((x) => ({
        flag: x as dotnetAddPackageFlags,
        value: options[x as keyof NugetReferenceGeneratorSchema],
      }))
  );

  return {
    success: true,
  };
}
