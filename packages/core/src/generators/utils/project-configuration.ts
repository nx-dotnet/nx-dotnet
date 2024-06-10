import {
  ProjectConfiguration,
  Tree,
  glob,
  readProjectConfiguration as readProjectConfigurationFromDevkit,
  updateProjectConfiguration as updateProjectConfigurationFromDevkit,
  addProjectConfiguration as addProjectConfigurationFromDevkit,
  readNxJson,
} from '@nx/devkit';

import { setupWorkspaceContext } from 'nx/src/utils/workspace-context';

import {
  createNodes,
  createProjectDefinition,
  isFileIgnored,
} from '../../graph/create-nodes';
import {
  mergeProjectConfigurationIntoRootMap,
  readProjectConfigurationsFromRootMap,
} from 'nx/src/project-graph/utils/project-configuration-utils';
import { readConfig } from '@nx-dotnet/utils';
import { tryReadJson } from './try-read-json';

export async function readProjectConfiguration(
  tree: Tree,
  name: string,
  root?: string,
): Promise<ProjectConfiguration> {
  const projectJson = readProjectJson(tree, name);
  const inferredProject = await readInferredProjectConfiguration(
    tree,
    name,
    root,
  );

  if (projectJson && inferredProject) {
    const rootMap: Record<string, ProjectConfiguration> = {};
    mergeProjectConfigurationIntoRootMap(
      rootMap,
      inferredProject,
      undefined,
      undefined,
      true,
    );
    mergeProjectConfigurationIntoRootMap(
      rootMap,
      projectJson,
      undefined,
      undefined,
      true,
    );
    return readProjectConfigurationsFromRootMap(rootMap)[name];
  }

  if (projectJson) return projectJson;
  if (inferredProject) return inferredProject;

  throw new Error(
    `Project ${name} not found. Found projects: ${Object.keys(
      (await getNxDotnetProjects(tree)).projects,
    )}`,
  );
}

export async function updateProjectConfiguration(
  tree: Tree,
  name: string,
  root: string,
  update: (
    projectJsonConfiguration: ProjectConfiguration | null,
    inferredConfiguration: ProjectConfiguration | null,
  ) => Partial<ProjectConfiguration>,
) {
  const projectJsonConfiguration = readProjectJson(tree, name);
  const inferredConfiguration = await readInferredProjectConfiguration(
    tree,
    name,
    root,
  );
  const updatedProjectJson = update(
    projectJsonConfiguration,
    inferredConfiguration,
  );
  if (projectJsonConfiguration) {
    updateProjectConfigurationFromDevkit(
      tree,
      name,
      updatedProjectJson as ProjectConfiguration,
    );
  } else {
    addProjectConfigurationFromDevkit(tree, name, {
      root,
      ...updatedProjectJson,
    });
  }
  return {
    name,
    ...updatedProjectJson,
    root,
  };
}

export function readProjectJson(
  tree: Tree,
  projectName: string,
): ProjectConfiguration | null {
  try {
    return readProjectConfigurationFromDevkit(tree, projectName);
  } catch {
    return null;
  }
}

export async function readInferredProjectConfiguration(
  tree: Tree,
  name: string,
  root?: string,
): Promise<ProjectConfiguration | null> {
  const inferredProjects = await getNxDotnetProjects(tree);
  return (
    inferredProjects.projects[name] ?? (root && inferredProjects.rootMap[root])
  );
}

async function getNxDotnetProjects(tree: Tree) {
  const rootMap: Record<string, ProjectConfiguration> = {};
  const config = readConfig(tree);

  if (config.inferProjects === false) {
    return { rootMap, projects: {} };
  }

  // During a generator run the workspace context has not
  // been updated with new files created by the generator.
  // Setting it back up will ensure its up to date, and allow
  // the files created by dotnet new to be picked up by the glob.
  setupWorkspaceContext(tree.root);
  const projectFiles = glob(tree, [createNodes[0]]);

  for (const file of projectFiles) {
    if (isFileIgnored(file, config)) {
      continue;
    }
    const fileContents = tree.read(file, 'utf-8');
    if (!fileContents) {
      continue;
    }
    const project = createProjectDefinition(
      file,
      fileContents,
      config,
      readNxJson(tree),
      tryReadJson(tree, 'package.json'),
    );
    if (!project) {
      continue;
    }
    mergeProjectConfigurationIntoRootMap(
      rootMap,
      project,
      undefined,
      undefined,
      true,
    );
  }

  return { rootMap, projects: readProjectConfigurationsFromRootMap(rootMap) };
}
