import { readProjectConfiguration, Tree } from '@nx/devkit';

import { DotNetClient, dotnetFactory } from '@nx-dotnet/dotnet';
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
  const {
    packageName,
    project: projectName,
    allowVersionMismatch,
    ...params
  } = options;
  const project = readProjectConfiguration(host, projectName);
  const projectFilePath = await getProjectFileForNxProject(project);

  const config = readConfig(host);
  config.nugetPackages ??= {};
  const configuredPkgVersion = config.nugetPackages[packageName];
  const resolvedVersion = await resolveVersionMismatch(
    options.version,
    configuredPkgVersion,
    allowVersionMismatch,
    packageName,
  );
  config.nugetPackages[packageName] = resolvedVersion;
  if (
    resolvedVersion !== options.version &&
    resolvedVersion !== ALLOW_MISMATCH
  ) {
    params.version = resolvedVersion;
  }

  try {
    dotnetClient.addPackageReference(projectFilePath, packageName, params);

    updateConfig(host, config);

    if (
      resolvedVersion !== ALLOW_MISMATCH &&
      resolvedVersion !== configuredPkgVersion &&
      resolvedVersion
    ) {
      updateDependencyVersions(host, packageName, resolvedVersion);
    }
  } catch (e: unknown) {
    console.warn('Config not updated since dotnet failed to add dependency!');
    throw e;
  }
}
