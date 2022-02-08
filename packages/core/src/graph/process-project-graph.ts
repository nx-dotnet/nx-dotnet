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
    visitProject(builder, context, project, name);
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
    (config, dependencyName, implicit) => {
      if (implicit) {
        builder.addImplicitDependency(projectName, dependencyName);
      } else {
        builder.addExplicitDependency(projectName, projectFile, dependencyName);
      }
    },
  );
}
