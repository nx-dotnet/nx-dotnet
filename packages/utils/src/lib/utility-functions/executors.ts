import {
  ExecutorContext,
  ProjectConfiguration,
  stripIndents,
} from '@nx/devkit';

export const getExecutedProjectConfiguration = (context: ExecutorContext) => {
  if (!context.projectName) {
    throw new Error(
      'Project name must be set on executor context to run @nx-dotnet executors.',
    );
  }
  if (
    !context.projectGraph &&
    !context.workspace &&
    !context.projectsConfigurations
  ) {
    throw new Error(
      '@nx-dotnet was unable to locate your projects configurations. ExecutorContext should contain projectGraph | workspace | projectsConfigurations',
    );
  }
  const possibleConfigurations: ProjectConfiguration[] = [
    context.projectsConfigurations?.projects[context.projectName],
    context.workspace?.projects[context.projectName],
    context.projectGraph?.nodes[context.projectName].data,
  ].filter((x) => !!x) as ProjectConfiguration[];

  if (possibleConfigurations.length === 0) {
    throw new Error(stripIndents`@nx-dotnet was unable to determine your projects configuration
    ExecutorContext: ${JSON.stringify(context, null, 2)}`);
  }

  return possibleConfigurations[0];
};
