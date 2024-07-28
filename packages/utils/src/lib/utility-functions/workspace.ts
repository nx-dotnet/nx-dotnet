import {
  DependencyType,
  getProjects,
  normalizePath as nxNormalizePath,
  NX_VERSION,
  ProjectConfiguration,
  Tree,
  readNxJson,
  readJsonFile,
  NxJsonConfiguration,
  ProjectGraph,
  reverse,
} from '@nx/devkit';

import { readFileSync } from 'fs';
import { lt } from 'semver';
import { XmlDocument } from 'xmldoc';

import { findProjectFileInPath, findProjectFileInPathSync, glob } from './glob';

export async function getProjectFileForNxProject(
  project: ProjectConfiguration,
  tree?: Tree,
) {
  const srcDirectory = project.root;
  return findProjectFileInPath(srcDirectory, tree);
}

export function getProjectFileForNxProjectSync(project: ProjectConfiguration) {
  const srcDirectory = project.root;
  return findProjectFileInPathSync(srcDirectory);
}

export function forEachDependantProject(
  targetProject: string,
  graph: ProjectGraph,
  forEachCallback?: (
    project: ProjectConfiguration,
    projectName: string,
    implicit: boolean,
  ) => void,
) {
  for (const dependant of graph.dependencies[targetProject] ?? []) {
    if (forEachCallback) {
      forEachCallback(
        graph.nodes[dependant.target].data,
        dependant.target,
        dependant.type === DependencyType.implicit,
      );
    }
  }
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
      `[nx-dotnet] The {workspaceRoot} token is only valid at the beginning of an output.`,
    );
  }
  value = value.replace('{projectRoot}', project.root);
  return value.replace('{projectName}', project.name as string);
}

export function isNxCrystalEnabled(tree?: Tree) {
  const nxJson: NxJsonConfiguration = tree
    ? (readNxJson(tree) ?? {})
    : readJsonFile('nx.json');

  if (nxJson.useInferencePlugins === false) {
    return false;
  }

  // not the default
  if (lt(NX_VERSION, '18.0.0')) {
    return process.env.NX_PCV3 === 'true' || process.env.NX_CRYSTAL === 'true';
  }
  // should be on by default
  return !(
    process.env.NX_PCV3 === 'false' || process.env.NX_CRYSTAL === 'false'
  );
}

function tryGetXmlDocument(file: string): XmlDocument | null {
  try {
    return new XmlDocument(readFileSync(file).toString());
  } catch {
    return null;
  }
}
