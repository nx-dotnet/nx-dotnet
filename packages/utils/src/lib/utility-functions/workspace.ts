import { ProjectConfiguration, WorkspaceJsonConfiguration } from '@nrwl/devkit';

import { readFileSync } from 'fs';
import { isAbsolute, resolve } from 'path';
import { XmlDocument, XmlElement } from 'xmldoc';

import { findProjectFileInPath, findProjectFileInPathSync } from './glob';

export async function getProjectFileForNxProject(
  project: ProjectConfiguration
) {
  const srcDirectory = project.root;
  return findProjectFileInPath(srcDirectory);
}

export function getProjectFileForNxProjectSync(project: ProjectConfiguration) {
  const srcDirectory = project.root;
  return findProjectFileInPathSync(srcDirectory);
}

export function getDependantProjectsForNxProject(
  targetProject: string,
  workspaceConfiguration: WorkspaceJsonConfiguration,
  forEachCallback?: (project: ProjectConfiguration, projectName: string) => void
): {
  [projectName: string]: ProjectConfiguration;
} {
  const projectRoots: { [key: string]: string } = {};
  const dependantProjects: { [key: string]: ProjectConfiguration } = {};

  Object.entries(workspaceConfiguration.projects).forEach(([name, project]) => {
    projectRoots[name] = resolve(project.root);
  });

  const netProjectFilePath = getProjectFileForNxProjectSync(
    workspaceConfiguration.projects[targetProject]
  );

  const xml: XmlDocument = new XmlDocument(
    readFileSync(netProjectFilePath).toString()
  );

  xml.childrenNamed('ItemGroup').forEach((itemGroup) =>
    itemGroup.childrenNamed('ProjectReference').forEach((x: XmlElement) => {
      const includeFilePath = x.attr['Include'];
      let absoluteFilePath: string;
      if (isAbsolute(includeFilePath)) {
        absoluteFilePath = includeFilePath;
      } else {
        absoluteFilePath = resolve(
          netProjectFilePath.split('/').slice(0, -1).join('/'),
          includeFilePath
        );
      }

      Object.entries(projectRoots).forEach(([dependency, path]) => {
        if (absoluteFilePath.startsWith(path)) {
          if (forEachCallback) {
            forEachCallback(
              workspaceConfiguration.projects[dependency],
              dependency
            );
          }
          dependantProjects[dependency] =
            workspaceConfiguration.projects[dependency];
        }
      });
    })
  );

  return dependantProjects;
}
