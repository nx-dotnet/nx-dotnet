import {
  addProjectConfiguration,
  getWorkspaceLayout,
  joinPathFragments,
  readProjectConfiguration,
  Tree,
  updateProjectConfiguration,
} from '@nrwl/devkit';
import { getSwaggerExecutorConfiguration } from '../../models/swagger-executor-configuration';
import { AddSwaggerJsonExecutorSchema } from './schema';

export default async function generateSwaggerSetup(
  host: Tree,
  options: AddSwaggerJsonExecutorSchema,
) {
  const project = readProjectConfiguration(host, options.project);
  project.targets ??= {};
  if (!options.output) {
    if (options.swaggerProject) {
      options.output = joinPathFragments(
        swaggerProjectRoot(host, options.swaggerProject),
        'swagger.json',
      );
      generateShellProject(host, {
        swaggerProject: options.swaggerProject,
        project: options.project,
      });
    } else {
      throw new Error('Either specify --output or --swagger-project');
    }
  }
  project.targets[options.target || 'swagger'] = {
    ...getSwaggerExecutorConfiguration(options.output),
  };
  updateProjectConfiguration(host, options.project, project);
}

function swaggerProjectRoot(host: Tree, swaggerProject: string) {
  return joinPathFragments(
    getWorkspaceLayout(host).libsDir,
    'generated',
    swaggerProject,
  );
}

function generateShellProject(
  host: Tree,
  options: { project: string; swaggerProject: string },
) {
  addProjectConfiguration(host, options.swaggerProject, {
    root: swaggerProjectRoot(host, options.swaggerProject),
    implicitDependencies: [options.project],
  });
}
