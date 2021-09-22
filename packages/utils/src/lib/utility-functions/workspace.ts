import {
  getProjects,
  normalizePath,
  NxJsonProjectConfiguration,
  ProjectConfiguration,
  Tree,
  WorkspaceJsonConfiguration,
} from '@nrwl/devkit';
import { appRootPath } from '@nrwl/tao/src/utils/app-root';

import { readFileSync } from 'fs';
import { dirname, isAbsolute, relative, resolve } from 'path';
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
    project: ProjectConfiguration &
      NxJsonProjectConfiguration & { projectFile: string },
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

  const netProjectFilePath = relative(
    process.cwd(),
    resolve(
      appRootPath,
      getProjectFileForNxProjectSync(
        workspaceConfiguration.projects[targetProject],
      ),
    ),
  );
  const hostProjectDirectory = normalizePath(dirname(netProjectFilePath));

  const xml: XmlDocument = new XmlDocument(
    readFileSync(netProjectFilePath).toString(),
  );

  xml.childrenNamed('ItemGroup').forEach((itemGroup) =>
    itemGroup.childrenNamed('ProjectReference').forEach((x: XmlElement) => {
      const includeFilePath = x.attr['Include'];
      const workspaceFilePath = normalizePath(
        isAbsolute(includeFilePath)
          ? includeFilePath
          : resolve(hostProjectDirectory, includeFilePath),
      );

      Object.entries(projectRoots).forEach(([dependency, path]) => {
        if (workspaceFilePath.startsWith(`${path}/`)) {
          if (forEachCallback) {
            forEachCallback(
              {
                ...workspaceConfiguration.projects[dependency],
                projectFile: workspaceFilePath,
              },
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
