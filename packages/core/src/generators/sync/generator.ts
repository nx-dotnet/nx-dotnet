import { Tree } from '@nrwl/devkit';

import {
  ALLOW_MISMATCH,
  getNxDotnetProjects,
  getProjectFilesForProject,
  iterateChildrenByPath,
  readConfig,
  readXml,
  updateConfig,
} from '@nx-dotnet/utils';

import { resolveVersionMismatch } from '../utils/resolve-version-mismatch';
import { updateDependencyVersions } from '../utils/update-dependency-version';

export default async function (host: Tree) {
  const config = readConfig(host);
  const projects = getNxDotnetProjects(host);

  for (const [projectName, configuration] of projects.entries()) {
    const projectFiles = getProjectFilesForProject(host, configuration);
    for (const f of projectFiles) {
      const xmldoc = readXml(host, f);
      console.log(`Scanning packages for ${projectName} (${f})`);
      await iterateChildrenByPath(
        xmldoc,
        'ItemGroup.PackageReference',
        async (reference) => {
          const pkg = reference.attr['Include'];
          const version = reference.attr['Version'];
          const configuredVersion = config.nugetPackages[pkg];

          if (
            version &&
            version !== configuredVersion &&
            configuredVersion !== ALLOW_MISMATCH
          ) {
            const resolved = await resolveVersionMismatch(
              version,
              configuredVersion,
              false,
              pkg,
            );
            // console.log('Resolved:', resolved)
            config.nugetPackages[pkg] = resolved;
            if (resolved !== ALLOW_MISMATCH) {
              updateDependencyVersions(host, pkg, resolved);
            }
          }
        },
      );
    }
  }
  updateConfig(host, config);
}
