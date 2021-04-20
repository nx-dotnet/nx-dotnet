import { ExecutorContext } from '@nrwl/devkit';

export const getExecutedProjectConfiguration = (context: ExecutorContext) => context.workspace.projects[context.projectName as string];