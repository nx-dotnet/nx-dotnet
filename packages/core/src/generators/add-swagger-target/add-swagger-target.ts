import {
  addProjectConfiguration,
  ensurePackage,
  GeneratorCallback,
  getWorkspaceLayout,
  joinPathFragments,
  ProjectConfiguration,
  readProjectConfiguration,
  readWorkspaceConfiguration,
  Tree,
  updateProjectConfiguration,
  updateWorkspaceConfiguration,
} from '@nrwl/devkit';
import { libraryGenerator } from '@nrwl/js/src/generators/library/library';

import { getSwaggerExecutorConfiguration } from '../../models/swagger-executor-configuration';
import { AddSwaggerJsonExecutorSchema } from './schema';

export default async function generateSwaggerSetup(
  host: Tree,
  options: AddSwaggerJsonExecutorSchema,
) {
  const tasks: GeneratorCallback[] = [];
  const project = readProjectConfiguration(host, options.project);
  project.targets ??= {};
  if (!options.output) {
    if (options.swaggerProject) {
      options.output = joinPathFragments(
        swaggerProjectRoot(host, options.swaggerProject),
        'swagger.json',
      );
      generateShellProject(host, {
        ...options,
        swaggerProject: options.swaggerProject,
        project: options.project,
        codegenProject: options.codegenProject,
      });
    } else {
      throw new Error('Either specify --output or --swagger-project');
    }
  } else {
    if (options.codegenProject && !options.useNxPluginOpenAPI) {
      project.targets.codegen = {
        executor: '@nx-dotnet/core:openapi-codegen',
        options: {
          openapiJsonPath: options.output,
          outputProject: options.codegenProject,
        },
        dependsOn: ['swagger'],
      };
    }
  }
  project.targets[options.target || 'swagger'] = {
    ...getSwaggerExecutorConfiguration(options.output),
  };

  if (options.codegenProject) {
    tasks.push(...(await generateCodegenProject(host, options)));
  }

  updateProjectConfiguration(host, options.project, project);

  return async () => {
    for (const task of tasks) {
      await task();
    }
  };
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
  options: AddSwaggerJsonExecutorSchema & { swaggerProject: string },
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
    if (!options.useNxPluginOpenAPI) {
      targets.codegen = {
        executor: '@nx-dotnet/core:openapi-codegen',
        options: {
          openapiJsonPath: `${swaggerProjectRoot(
            host,
            options.swaggerProject,
          )}/swagger.json`,
          outputProject: `generated-${options.codegenProject}`,
        },
        dependsOn: ['^swagger'],
      };
    }
  }
  addProjectConfiguration(host, options.swaggerProject, {
    root,
    targets,
    implicitDependencies: [options.project],
  });
}

async function generateCodegenProject(
  host: Tree,
  options: AddSwaggerJsonExecutorSchema,
): Promise<GeneratorCallback[]> {
  const tasks: GeneratorCallback[] = [];
  const nameWithDirectory = `generated-${options.codegenProject}`;
  if (options.useNxPluginOpenAPI) {
    ensurePackage(host, '@trumbitta/nx-plugin-openapi', '^1.12.1');
    const {
      default: nxPluginOpenAPIGenerator,
    }: // eslint-disable-next-line @typescript-eslint/no-var-requires
    typeof import('@trumbitta/nx-plugin-openapi/src/generators/api-lib/generator') = require('@trumbitta/nx-plugin-openapi/src/generators/api-lib/generator');
    const {
      default: nxPluginOpenAPIInitGenerator,
    }: // eslint-disable-next-line @typescript-eslint/no-var-requires
    typeof import('@trumbitta/nx-plugin-openapi/src/generators/init/generator') = require('@trumbitta/nx-plugin-openapi/src/generators/init/generator');

    tasks.push(await nxPluginOpenAPIInitGenerator(host));

    tasks.push(
      await nxPluginOpenAPIGenerator(host, {
        isRemoteSpec: false,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        name: options.codegenProject!,
        directory: 'generated',
        generator: 'typescript-fetch',
        sourceSpecLib: options.swaggerProject,
      }),
    );

    const configuration = readProjectConfiguration(host, nameWithDirectory);
    configuration.targets ??= {};
    const targetConfiguration = configuration.targets?.['generate-sources'];
    targetConfiguration.options['sourceSpecPathOrUrl'] = joinPathFragments(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      readProjectConfiguration(host, options.swaggerProject!).root,
      'swagger.json',
    );
    targetConfiguration.dependsOn = ['^swagger'];
    configuration.targets['codegen'] = targetConfiguration;
    delete configuration.targets['generate-sources'];
    updateProjectConfiguration(host, nameWithDirectory, configuration);
  } else {
    tasks.push(
      await libraryGenerator(host, {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        name: options.codegenProject!,
        directory: 'generated',
        buildable: true,
      }),
    );
    const codegenProjectConfiguration = readProjectConfiguration(
      host,
      nameWithDirectory,
    );
    codegenProjectConfiguration.implicitDependencies ??= [];
    codegenProjectConfiguration.implicitDependencies.push(
      options.swaggerProject ? options.swaggerProject : options.project,
    );
    updateProjectConfiguration(
      host,
      nameWithDirectory,
      codegenProjectConfiguration,
    );
  }

  const wc = readWorkspaceConfiguration(host);

  const cacheableOperations: string[] | null =
    wc.tasksRunnerOptions?.default?.options?.cacheableOperations;
  if (cacheableOperations) {
    cacheableOperations.push('codegen', options.target ?? 'swagger');
  }

  const newBuildDeps = ['codegen', '^codegen'];
  wc.targetDefaults ??= {};
  wc.targetDefaults['build'] ??= {};
  wc.targetDefaults['build'].dependsOn ??= [];
  wc.targetDefaults['build'].dependsOn.push(...newBuildDeps);

  updateWorkspaceConfiguration(host, wc);

  return tasks;
}
