import { Tree } from '@nrwl/devkit';

import {
  getNxDotnetProjects,
  getProjectFilesForProject,
  iterateChildrenByPath,
  readXml,
} from '@nx-dotnet/utils';

export async function updateDependencyVersions(
  host: Tree,
  packageName: string,
  version: string,
) {
  const projects = await getNxDotnetProjects(host);
  for (const [projectName, configuration] of projects.entries()) {
    const projectFiles = getProjectFilesForProject(host, configuration);
    for (const f of projectFiles) {
      const xmldoc = readXml(host, f);
      let updateFile = false;
      await iterateChildrenByPath(
        xmldoc,
        'ItemGroup.PackageReference',
        (reference) => {
          if (
            reference.attr['Include'] === packageName &&
            reference.attr['Version'] !== version
          ) {
            console.warn(
              `Updating ${projectName} to use ${packageName} v${version}`,
            );
            reference.attr['Version'] = version;
            updateFile = true;
          }
        },
      );
      if (updateFile) {
        host.write(f, xmldoc.toString());
      }
    }
  }
}
