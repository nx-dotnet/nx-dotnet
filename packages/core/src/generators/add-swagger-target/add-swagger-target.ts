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
        codegenProject: options.codegenProject,
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
        dependsOn: [
          {
            target: options.target || 'swagger',
            projects: 'self',
          },
        ],
      };
    }
  }
  project.targets[options.target || 'swagger'] = {
    ...getSwaggerExecutorConfiguration(options.output),
  };

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
  options: { project: string; swaggerProject: string; codegenProject?: string },
) {
  const root = swaggerProjectRoot(host, options.swaggerProject);
  const targets: ProjectConfiguration['targets'] = {};
  if (options.codegenProject) {
    // If typescript lib is buildable,
    // then this lib must be too. It seems
    // a little silly, but we **need** this target.
    targets.build = {
      executor: 'nx:noop',
      outputs: [root],
    };
    targets.codegen = {
      executor: '@nx-dotnet/core:openapi-codegen',
      options: {
        openapiJsonPath: `${swaggerProjectRoot(
          host,
          options.swaggerProject,
        )}/swagger.json`,
        outputProject: `generated-${options.codegenProject}`,
      },
      dependsOn: [
        {
          projects: 'dependencies',
          target: 'swagger',
        },
      ],
    };
  }
  addProjectConfiguration(host, options.swaggerProject, {
    root,
    targets,
    implicitDependencies: [options.project],
  });
}
