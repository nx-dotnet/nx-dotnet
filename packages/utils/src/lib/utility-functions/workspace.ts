import {
  getProjects,
  normalizePath as nxNormalizePath,
  ProjectConfiguration,
  Tree,
  WorkspaceJsonConfiguration,
  workspaceRoot,
} from '@nrwl/devkit';

import { readFileSync } from 'fs';
import { dirname, isAbsolute, relative, resolve } from 'path';
import { XmlDocument, XmlElement } from 'xmldoc';

import { findProjectFileInPath, findProjectFileInPathSync, glob } from './glob';

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
    project: ProjectConfiguration & { projectFile: string },
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

  const absoluteNetProjectFilePath = resolve(
    workspaceRoot,
    getProjectFileForNxProjectSync(
      workspaceConfiguration.projects[targetProject],
    ),
  );
  const netProjectFilePath = relative(
    workspaceRoot,
    absoluteNetProjectFilePath,
  );
  const hostProjectDirectory = normalizePath(dirname(netProjectFilePath));

  const xml: XmlDocument = new XmlDocument(
    readFileSync(absoluteNetProjectFilePath).toString(),
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

export async function getNxDotnetProjects(
  host: Tree,
): Promise<Map<string, ProjectConfiguration>> {
  const allProjects = getProjects(host);

  for (const key in allProjects) {
    const p = allProjects.get(key);

    let isNetProject = false;
    for (const pattern of ['*.csproj', '*.fsproj', '*.vbproj'] as const) {
      if (await glob(pattern, p?.root)) {
        isNetProject = true;
        break;
      }
    }

    if (!isNetProject) {
      allProjects.delete(key);
    }
  }

  return allProjects;
}

export function getProjectFilesForProject(
  host: Tree,
  project: ProjectConfiguration | undefined,
  projectName: string,
) {
  if (!project?.sourceRoot && !project?.root) {
    throw new Error(`Unable to read source root for project ${projectName}`);
  }
  return host
    .children(project.sourceRoot ?? project.root)
    .filter((x) => x.endsWith('proj'))
    .map((x) => `${project.sourceRoot}/${x}`);
}

/**
 * Currently @nrwl/devkit[normalizePath] functionality differs a bit based on OS. See
 */
function normalizePath(p: string): string {
  return nxNormalizePath(p).split('\\').join('/');
}
