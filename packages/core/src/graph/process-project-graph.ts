import {
  DependencyType,
  ProjectConfiguration,
  ProjectGraph,
  ProjectGraphBuilder,
  ProjectGraphProcessorContext,
} from '@nrwl/devkit';

import { getDependantProjectsForNxProject } from '@nx-dotnet/utils';

export function processProjectGraph(
  graph: ProjectGraph,
  context: ProjectGraphProcessorContext
) {
  const builder = new ProjectGraphBuilder(graph);

  Object.entries(context.workspace.projects).forEach(([name, project]) => {
    try {
      if (project.tags?.some((x) => x === 'nx-dotnet')) {
        visitProject(builder, context, project, name);
      }
    } catch {
      console.warn(
        `nx-dotnet encountered an error parsing dependencies for ${name}`
      );
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
  getDependantProjectsForNxProject(
    projectName,
    context.workspace,
    (projectConfig, dependencyName) => {
      builder.addDependency(DependencyType.static, projectName, dependencyName);
    }
  );
}
