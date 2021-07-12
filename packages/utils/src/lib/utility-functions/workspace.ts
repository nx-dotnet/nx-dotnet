import {
  getProjects,
  NxJsonProjectConfiguration,
  ProjectConfiguration,
  Tree,
  WorkspaceJsonConfiguration,
} from '@nrwl/devkit';

import { readFileSync } from 'fs';
import { dirname, isAbsolute, resolve } from 'path';
import { XmlDocument, XmlElement } from 'xmldoc';

import { NXDOTNET_TAG } from '../constants';
import { findProjectFileInPath, findProjectFileInPathSync } from './glob';

export async function getProjectFileForNxProject(
  project: ProjectConfiguration,
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
  forEachCallback?: (
    project: ProjectConfiguration,
    projectName: string,
  ) => void,
): {
  [projectName: string]: ProjectConfiguration;
} {
  const projectRoots: { [key: string]: string } = {};
  const dependantProjects: { [key: string]: ProjectConfiguration } = {};

  Object.entries(workspaceConfiguration.projects).forEach(([name, project]) => {
    projectRoots[name] = resolve(project.root);
  });

  const netProjectFilePath = getProjectFileForNxProjectSync(
    workspaceConfiguration.projects[targetProject],
  );
  const hostProjectDirectory = dirname(netProjectFilePath).replace(/\\/g, '/');

  const xml: XmlDocument = new XmlDocument(
    readFileSync(netProjectFilePath).toString(),
  );

  xml.childrenNamed('ItemGroup').forEach((itemGroup) =>
    itemGroup.childrenNamed('ProjectReference').forEach((x: XmlElement) => {
      const includeFilePath = x.attr['Include'].replace(/\\/g, '/');
      let absoluteFilePath: string;
      if (isAbsolute(includeFilePath)) {
        absoluteFilePath = includeFilePath;
      } else {
        absoluteFilePath = resolve(hostProjectDirectory, includeFilePath);
      }

      Object.entries(projectRoots).forEach(([dependency, path]) => {
        if (absoluteFilePath.startsWith(path)) {
          if (forEachCallback) {
            forEachCallback(
              workspaceConfiguration.projects[dependency],
              dependency,
            );
          }
          dependantProjects[dependency] =
            workspaceConfiguration.projects[dependency];
        }
      });
    }),
  );

  return dependantProjects;
}

export function getNxDotnetProjects(
  host: Tree,
): Map<string, ProjectConfiguration & NxJsonProjectConfiguration> {
  const allProjects = getProjects(host);

  for (const key in allProjects) {
    const p = allProjects.get(key);
    if (!p?.tags?.includes(NXDOTNET_TAG)) {
      allProjects.delete(key);
    }
  }

  return allProjects;
}

export function getProjectFilesForProject(
  host: Tree,
  project: ProjectConfiguration | undefined,
) {
  if (!project?.sourceRoot) {
    throw new Error('Unable to read source root for project!');
  }
  return host
    .children(project.sourceRoot)
    .filter((x) => x.endsWith('proj'))
    .map((x) => `${project.sourceRoot}/${x}`);
}
