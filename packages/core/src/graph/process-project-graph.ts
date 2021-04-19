import {
    DependencyType, ProjectConfiguration, ProjectGraph, ProjectGraphBuilder,
    ProjectGraphProcessorContext
} from '@nrwl/devkit';

import { getDependantProjectsForNxProject } from '@nx-dotnet/utils';

export function processProjectGraph(
  graph: ProjectGraph,
  context: ProjectGraphProcessorContext
) {
  const builder = new ProjectGraphBuilder(graph);

  Object.entries(context.workspace.projects).forEach(([name, project]) => {
    try {
      visitProject(builder, context, project, name);
    } catch {
      console.warn(`Failed to generate .NET dependencies for ${name}`);
    }
  });

  return builder.getProjectGraph();
}

function visitProject(
  builder: ProjectGraphBuilder,
  context: ProjectGraphProcessorContext,
  project: ProjectConfiguration,
  projectName: string
) {
  console.log('Looking for dependencies for ', projectName);
  getDependantProjectsForNxProject(
    projectName,
    context.workspace,
    (projectConfig, dependencyName) => {
      builder.addDependency(DependencyType.static, projectName, dependencyName);
    }
  );
}
