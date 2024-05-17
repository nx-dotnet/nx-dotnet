import {
  ProjectConfiguration,
  Tree,
  glob,
  readProjectConfiguration as readProjectConfigurationFromDevkit,
  updateProjectConfiguration as updateProjectConfigurationFromDevkit,
  addProjectConfiguration as addProjectConfigurationFromDevkit,
} from '@nx/devkit';
import { createNodes } from '../../graph/create-nodes';
import {
  mergeProjectConfigurationIntoRootMap,
  readProjectConfigurationsFromRootMap,
} from 'nx/src/project-graph/utils/project-configuration-utils';

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

  throw new Error(`Project ${name} not found`);
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
  const projectFiles = glob(tree, [createNodes[0]]);
  const rootMap: Record<string, ProjectConfiguration> = {};

  for (const file of projectFiles) {
    const result = await createNodes[1](file, undefined, undefined);
    for (const root in result.projects) {
      mergeProjectConfigurationIntoRootMap(
        rootMap,
        {
          ...result.projects[root],
          root,
        },
        undefined,
        undefined,
        true,
      );
    }
  }

  return { rootMap, projects: readProjectConfigurationsFromRootMap(rootMap) };
}
