import {
  addProjectConfiguration,
  getWorkspaceLayout,
  joinPathFragments,
  ProjectConfiguration,
  readProjectConfiguration,
  Tree,
  updateProjectConfiguration,
} from '@nrwl/devkit';
import { libraryGenerator } from '@nrwl/js/src/generators/library/library';

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
  } else {
    if (options.codegenProject) {
      project.targets.codegen = {
        executor: '@nx-dotnet/core:openapi-codegen',
        options: {
          openapiJsonPath: options.output,
          outputProject: options.codegenProject,
        },
      };
    }
  }
  project.targets[options.target || 'swagger'] = {
    ...getSwaggerExecutorConfiguration(options.output),
  };
  updateProjectConfiguration(host, options.project, project);

  if (options.codegenProject) {
    await libraryGenerator(host, {
      name: options.codegenProject,
      directory: 'generated',
      buildable: true,
    });
    const codegenProjectConfiguration = readProjectConfiguration(
      host,
      `generated-${options.codegenProject}`,
    );
    codegenProjectConfiguration.implicitDependencies ??= [];
    codegenProjectConfiguration.implicitDependencies.push(
      options.swaggerProject ? options.swaggerProject : options.project,
    );
  }
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
  options: { project: string; swaggerProject: string; codegenProject?: string },
) {
  const targets: ProjectConfiguration['targets'] = {};
  if (options.codegenProject) {
    targets.codegen = {
      executor: '@nx-dotnet/core:openapi-codegen',
      options: {
        openapiJsonPath: `${swaggerProjectRoot(
          host,
          options.swaggerProject,
        )}/swagger.json`,
        outputProject: `generated-${options.codegenProject}`,
      },
    };
  }
  addProjectConfiguration(host, options.swaggerProject, {
    root: swaggerProjectRoot(host, options.swaggerProject),
    targets,
    implicitDependencies: [options.project],
  });
}
