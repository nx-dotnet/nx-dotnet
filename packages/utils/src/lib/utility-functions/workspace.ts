import {
  getProjects,
  normalizePath as nxNormalizePath,
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
    implicit: boolean,
  ) => void,
): {
  [projectName: string]: ProjectConfiguration;
} {
  const projectRoots: { [key: string]: string } = {};
  const dependantProjects: { [key: string]: ProjectConfiguration } = {};

  Object.entries(workspaceConfiguration.projects).forEach(([name, project]) => {
    projectRoots[name] = normalizePath(resolve(project.root));
  });

  const netProjectFilePath = relative(
    appRootPath,
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
      const includeFilePath = normalizePath(x.attr['Include']);
      const implicit = x.attr['ReferenceOutputAssembly'] === 'false';
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
              implicit,
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

/**
 * Currently @nrwl/devkit[normalizePath] functionality differs a bit based on OS. See
 */
function normalizePath(p: string): string {
  return nxNormalizePath(p).split('\\').join('/');
}
