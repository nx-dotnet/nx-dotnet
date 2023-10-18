import {
  DependencyType,
  getProjects,
  normalizePath as nxNormalizePath,
  ProjectConfiguration,
  ProjectsConfigurations,
  RawProjectGraphDependency,
  Tree,
  workspaceRoot,
} from '@nx/devkit';

import { readFileSync } from 'fs';
import { NX_PREFIX } from 'nx/src/utils/logger';
import { dirname, relative, resolve } from 'path';
import { XmlDocument, XmlElement } from 'xmldoc';

import { findProjectFileInPath, findProjectFileInPathSync, glob } from './glob';
import { getAbsolutePath } from './path';

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
    project: ProjectConfiguration,
    projectName: string,
    implicit: boolean,
  ) => void,
): {
  [projectName: string]: ProjectConfiguration;
} {
  const projectRoots: { [key: string]: string } = {};
  const dependantProjects: { [key: string]: ProjectConfiguration } = {};

  Object.entries(projectsConfiguration.projects).forEach(([name, project]) => {
    projectRoots[project.root] = name;
  });

  const absoluteNetProjectFilePath = resolve(
    workspaceRoot,
    getProjectFileForNxProjectSync(
      projectsConfiguration.projects[targetProject],
    ),
  );

  const dependencies = getDependenciesFromXmlFile(
    absoluteNetProjectFilePath,
    targetProject,
    projectRoots,
  );

  for (const dependency of dependencies) {
    const project = projectsConfiguration.projects[dependency.target];
    if (!project) {
      throw new Error(
        `Unable to find project ${dependency.target} in workspace`,
      );
    }
    if (forEachCallback) {
      forEachCallback(
        project,
        dependency.target,
        dependency.type === DependencyType.implicit,
      );
    }
    dependantProjects[dependency.target] = project;
  }

  return dependantProjects;
}

export function getDependenciesFromXmlFile(
  filePath: string,
  source: string,
  projectRootMap: Record<string, string>,
): RawProjectGraphDependency[] {
  const found: RawProjectGraphDependency[] = [];

  const absoluteNetProjectFilePath = getAbsolutePath(filePath, workspaceRoot);
  const netProjectFilePath = relative(
    workspaceRoot,
    absoluteNetProjectFilePath,
  );
  const hostProjectDirectory = normalizePath(
    dirname(absoluteNetProjectFilePath),
  );

  const xml: XmlDocument | null = tryGetXmlDocument(absoluteNetProjectFilePath);

  if (!xml) {
    return found;
  }

  xml.childrenNamed('ItemGroup').forEach((itemGroup) =>
    itemGroup.childrenNamed('ProjectReference').forEach((x: XmlElement) => {
      const includeFilePath = normalizePath(x.attr['Include']);
      const implicit = x.attr['ReferenceOutputAssembly'] === 'false';
      const absoluteIncludedPath = getAbsolutePath(
        includeFilePath,
        hostProjectDirectory,
      );
      const workspaceFilePath = normalizePath(
        relative(workspaceRoot, absoluteIncludedPath),
      );

      let potentialTargetRoot = dirname(workspaceFilePath);
      while (
        potentialTargetRoot !== workspaceRoot &&
        potentialTargetRoot !== '.'
      ) {
        if (projectRootMap[potentialTargetRoot]) {
          found.push({
            source,
            target: projectRootMap[potentialTargetRoot],
            type: implicit ? DependencyType.implicit : DependencyType.static,
            sourceFile: netProjectFilePath,
          });
          break;
        }

        potentialTargetRoot = dirname(potentialTargetRoot);
      }
    }),
  );

  return found;
}

export async function getNxDotnetProjects(
  host: Tree,
): Promise<Map<string, ProjectConfiguration>> {
  const allProjects = getProjects(host);

  for (const [key, p] of allProjects) {
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
 * Currently @nx/devkit[normalizePath] functionality differs a bit based on OS. See
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

function tryGetXmlDocument(file: string): XmlDocument | null {
  try {
    return new XmlDocument(readFileSync(file).toString());
  } catch {
    return null;
  }
}
