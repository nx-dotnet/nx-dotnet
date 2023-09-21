import {
  addProjectConfiguration,
  ensurePackage,
  GeneratorCallback,
  getWorkspaceLayout,
  joinPathFragments,
  ProjectConfiguration,
  readProjectConfiguration,
  readNxJson,
  Tree,
  updateProjectConfiguration,
  updateNxJson,
  addDependenciesToPackageJson,
} from '@nx/devkit';

import type NxPluginOpenAPILibGenerator = require('@trumbitta/nx-plugin-openapi/src/generators/api-lib/generator');
import type NxPluginOpenAPIInitGenerator = require('@trumbitta/nx-plugin-openapi/src/generators/init/generator');

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
  } else if (options.codegenProject && !options.useNxPluginOpenAPI) {
    project.targets.codegen = {
      executor: '@nx-dotnet/core:openapi-codegen',
      options: {
        openapiJsonPath: options.output,
        outputProject: options.codegenProject,
      },
      dependsOn: ['swagger'],
    };
  }
  project.targets[options.target ?? 'swagger'] = {
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
    await setupOpenAPICodegen(host, tasks, options, nameWithDirectory);
  } else {
    await setupNxNETCodegen(tasks, host, options, nameWithDirectory);
  }

  updateNxJsonForCodegenTargets(host, options);

  return tasks;
}

async function setupOpenAPICodegen(
  host: Tree,
  tasks: GeneratorCallback[],
  options: AddSwaggerJsonExecutorSchema,
  nameWithDirectory: string,
) {
  ensurePackage(host, '@trumbitta/nx-plugin-openapi', '^1.12.1');
  tasks.push(
    addDependenciesToPackageJson(
      host,
      {},
      { '@trumbitta/nx-plugin-openapi': '^1.12.1' },
    ),
  );
  const {
    default: nxPluginOpenAPIGenerator,
  }: // eslint-disable-next-line @typescript-eslint/no-var-requires
  typeof NxPluginOpenAPILibGenerator = require('@trumbitta/nx-plugin-openapi/src/generators/api-lib/generator');
  const {
    default: nxPluginOpenAPIInitGenerator,
  }: // eslint-disable-next-line @typescript-eslint/no-var-requires
  typeof NxPluginOpenAPIInitGenerator = require('@trumbitta/nx-plugin-openapi/src/generators/init/generator');

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
}

async function setupNxNETCodegen(
  tasks: GeneratorCallback[],
  host: Tree,
  options: AddSwaggerJsonExecutorSchema,
  nameWithDirectory: string,
) {
  const {
    libraryGenerator,
  }: // eslint-disable-next-line @typescript-eslint/no-var-requires
  typeof import('@nx/js') = require('@nx/js');
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

function updateNxJsonForCodegenTargets(
  host: Tree,
  options: AddSwaggerJsonExecutorSchema,
) {
  const wc = readNxJson(host);

  if (!wc) {
    return;
  }

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

  updateNxJson(host, wc);
}
