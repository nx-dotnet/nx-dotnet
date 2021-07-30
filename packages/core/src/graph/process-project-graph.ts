import {
  ProjectConfiguration,
  ProjectGraph,
  ProjectGraphBuilder,
  ProjectGraphProcessorContext,
} from '@nrwl/devkit';

import { getDependantProjectsForNxProject } from '@nx-dotnet/utils';

export function processProjectGraph(
  graph: ProjectGraph,
  context: ProjectGraphProcessorContext,
) {
  const builder = new ProjectGraphBuilder(graph);

  Object.entries(context.workspace.projects).forEach(([name, project]) => {
    try {
      if (project.tags?.some((x) => x === 'nx-dotnet')) {
        visitProject(builder, context, project, name);
      }
    } catch {
      console.warn(
        `nx-dotnet encountered an error parsing dependencies for ${name}`,
      );
    }
  });

  return builder.getUpdatedProjectGraph();
}

function visitProject(
  builder: ProjectGraphBuilder,
  context: ProjectGraphProcessorContext,
  project: ProjectConfiguration,
  projectName: string,
) {
  getDependantProjectsForNxProject(
    projectName,
    context.workspace,
    ({ projectFile }, dependencyName) => {
      builder.addExplicitDependency(projectName, projectFile, dependencyName);
    },
  );
}
