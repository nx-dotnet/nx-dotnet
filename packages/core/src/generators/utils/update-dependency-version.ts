import {
  getProjects,
  readProjectConfiguration,
  Tree,
  WorkspaceConfiguration,
  WorkspaceJsonConfiguration,
} from '@nrwl/devkit';
import { NXDOTNET_TAG } from '@nx-dotnet/utils';
import { XmlDocument } from 'xmldoc';

export function UpdateDependencyVersions(
  host: Tree,
  packageName: string,
  version: string,
) {
  const projects = getProjects(host);
  projects.forEach((configuration, projectName) => {
    if (
      configuration.tags?.includes(NXDOTNET_TAG) &&
      configuration.sourceRoot
    ) {
      const projectFiles = host
        .children(configuration.sourceRoot)
        .filter((x) => x.endsWith('proj'))
        .map((x) => `${configuration.sourceRoot}/${x}`);
      console.log(projectName, projectFiles);

      projectFiles.forEach((f) => {
        let fileText = host.read(f)?.toString();
        if (fileText) {
          let updateFile = false;
          const xmldoc = new XmlDocument(fileText);
          xmldoc.childrenNamed('ItemGroup').forEach((itemGroup) => {
            itemGroup.childrenNamed('PackageReference').forEach((reference) => {
              console.log(
                reference.attr['Include'],
                reference.attr['Version'],
                ':',
                packageName,
                version,
              );
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
            });
          });
          if (updateFile) {
            host.write(f, xmldoc.toString());
          }
        }
      });
    }
  });
}
