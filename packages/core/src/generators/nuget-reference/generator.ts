import { readProjectConfiguration, Tree } from '@nrwl/devkit';

import {
  dotnetAddPackageFlags,
  DotNetClient,
  dotnetFactory,
} from '@nx-dotnet/dotnet';
import {
  ALLOW_MISMATCH,
  getProjectFileForNxProject,
  readConfig,
  updateConfig,
} from '@nx-dotnet/utils';

import { resolveVersionMismatch } from '../utils/resolve-version-mismatch';
import { updateDependencyVersions } from '../utils/update-dependency-version';
import { NugetReferenceGeneratorSchema } from './schema';

export default async function (
  host: Tree,
  options: NugetReferenceGeneratorSchema,
  dotnetClient = new DotNetClient(dotnetFactory()),
) {
  const project = readProjectConfiguration(host, options.project);
  const projectFilePath = await getProjectFileForNxProject(project);

  const config = readConfig(host);
  const configuredPkgVersion = config.nugetPackages[options.packageName];
  const resolvedVersion = await resolveVersionMismatch(
    options.version,
    configuredPkgVersion,
    options.allowVersionMismatch,
  );
  config.nugetPackages[options.packageName] = resolvedVersion;
  if (
    resolvedVersion !== options.version &&
    resolvedVersion !== ALLOW_MISMATCH
  ) {
    options.version = resolvedVersion;
  }

  try {
    dotnetClient.addPackageReference(
      projectFilePath,
      options.packageName,
      Object.keys(options)
        .filter((x) => x !== 'packageName' && x !== 'project')
        .map((x) => ({
          flag: x as dotnetAddPackageFlags,
          value: options[x as keyof NugetReferenceGeneratorSchema],
        })),
    );

    updateConfig(host, config);

    if (
      resolvedVersion !== ALLOW_MISMATCH &&
      resolvedVersion !== configuredPkgVersion &&
      resolvedVersion
    ) {
      updateDependencyVersions(host, options.packageName, resolvedVersion);
    }
  } catch (e: unknown) {
    console.warn('Config not updated since dotnet failed to add dependency!');
    throw e;
  }
}
