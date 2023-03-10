import {
  getProjects,
  normalizePath as nxNormalizePath,
  ProjectConfiguration,
  ProjectsConfigurations,
  Tree,
  workspaceRoot,
} from '@nrwl/devkit';

import { readFileSync } from 'fs';
import { NX_PREFIX } from 'nx/src/utils/logger';
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
  projectsConfiguration: ProjectsConfigurations,
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

  Object.entries(projectsConfiguration.projects).forEach(([name, project]) => {
    projectRoots[name] = normalizePath(resolve(project.root));
  });

  const absoluteNetProjectFilePath = resolve(
    workspaceRoot,
    getProjectFileForNxProjectSync(
      projectsConfiguration.projects[targetProject],
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
                ...projectsConfiguration.projects[dependency],
                projectFile: workspaceFilePath,
              },
              dependency,
              implicit,
            );
          }
          dependantProjects[dependency] =
            projectsConfiguration.projects[dependency];
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
      const matches = await glob(pattern, p?.root);
      if (matches?.length) {
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
    .map((x) => `${project.sourceRoot ?? project.root}/${x}`);
}

/**
 * Currently @nrwl/devkit[normalizePath] functionality differs a bit based on OS. See
 */
function normalizePath(p: string): string {
  return nxNormalizePath(p).split('\\').join('/');
}

export function inlineNxTokens(value: string, project: ProjectConfiguration) {
  if (value.startsWith('{workspaceRoot}/')) {
    value = value.replace(/^\{workspaceRoot\}\//, '');
  }
  if (value.includes('{workspaceRoot}')) {
    throw new Error(
      `${NX_PREFIX} The {workspaceRoot} token is only valid at the beginning of an output.`,
    );
  }
  value = value.replace('{projectRoot}', project.root);
  return value.replace('{projectName}', project.name as string);
}
