import {
  ProjectConfiguration,
  ProjectGraph,
  ProjectGraphBuilder,
  ProjectGraphProcessorContext,
} from '@nrwl/devkit';

import {
  getDependantProjectsForNxProject,
  getProjectFileForNxProjectSync,
} from '@nx-dotnet/utils';

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
  const projectFile = getProjectFileForNxProjectSync(project);
  getDependantProjectsForNxProject(
    projectName,
    context.workspace,
    (config, dependencyName) => {
      builder.addExplicitDependency(projectName, projectFile, dependencyName);
    },
  );
}
