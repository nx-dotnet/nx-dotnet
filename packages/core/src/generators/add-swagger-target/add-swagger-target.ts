import {
  addProjectConfiguration,
  GeneratorCallback,
  getWorkspaceLayout,
  joinPathFragments,
  ProjectConfiguration,
  readNxJson,
  Tree,
  updateNxJson,
  addDependenciesToPackageJson,
  NX_VERSION,
  TargetConfiguration,
} from '@nx/devkit';

import { getSwaggerExecutorConfiguration } from '../../models/swagger-executor-configuration';
import { AddSwaggerJsonExecutorSchema } from './schema';
import { major } from 'semver';
import { OpenapiCodegenExecutorSchema } from '../../executors/openapi-codegen/schema';
import { updateProjectConfiguration } from '../utils/project-configuration';
import * as path from 'node:path';

type NormalizedOptions = AddSwaggerJsonExecutorSchema & {
  output: string;
};

async function normalizeOptions(
  host: Tree,
  options: AddSwaggerJsonExecutorSchema,
): Promise<NormalizedOptions> {
  if (!options.output && !options.swaggerProject) {
    throw new Error('Either specify --output or --swagger-project');
  }

  const output =
    //eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    options.output ?? swaggerProjectRoot(host, options.swaggerProject!);

  return {
    ...options,
    output,
  };
}

export default async function generateSwaggerSetup(
  host: Tree,
  options: AddSwaggerJsonExecutorSchema,
) {
  const tasks: GeneratorCallback[] = [];
  const normalizedOptions = await normalizeOptions(host, options);
  const { name: project } = await updateProjectConfiguration(
    host,
    normalizedOptions.project,
    normalizedOptions.projectRoot,
    (projectJson) => ({
      ...projectJson,
      targets: {
        ...projectJson?.targets,
        [normalizedOptions.target ?? 'swagger']:
          getSwaggerExecutorConfiguration(normalizedOptions.output),
      },
    }),
  );

  if (normalizedOptions.swaggerProject) {
    const shellTasks = await generateShellProject(host, {
      ...options,
      swaggerProject: normalizedOptions.swaggerProject,
      project,
      codegenProject: normalizedOptions.codegenProject,
      output: normalizedOptions.output,
    });
    tasks.push(...shellTasks);
  } else {
    throw new Error('Either specify --output or --swagger-project');
  }

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

async function generateShellProject(
  host: Tree,
  options: NormalizedOptions & {
    swaggerProject: string;
  },
) {
  const root = swaggerProjectRoot(host, options.swaggerProject);
  const targets: ProjectConfiguration['targets'] = {};
  const tasks: GeneratorCallback[] = [];

  const project: ProjectConfiguration = {
    root,
    targets,
    implicitDependencies: [options.project],
  };

  if (options.codegenProject) {
    // If typescript lib is buildable,
    // then this lib must be too. It seems
    // a little silly, but we **need** this target.
    targets.build = {
      executor: 'nx:noop',
      outputs: [root],
    };

    const { tasks: codegenTasks, name: codegenProjectName } =
      await generateCodegenProject(
        host,
        options as NormalizedOptions & { codegenProject: string },
      );

    tasks.push(...codegenTasks);

    if (options.useOpenApiGenerator) {
      tasks.push(
        addDependenciesToPackageJson(
          host,
          {},
          { '@openapitools/openapi-generator-cli': '^2.13.4' },
        ),
      );
    }

    project.targets ??= {};
    project.targets.codegen = {
      executor: '@nx-dotnet/core:openapi-codegen',
      options: options.useOpenApiGenerator
        ? {
            useOpenApiGenerator: true,
            openApiGenerator: 'typescript',
            openapiJsonPath: options.output,
            outputProject: codegenProjectName,
          }
        : {
            openapiJsonPath: options.output,
            outputProject: codegenProjectName,
          },
      dependsOn: ['swagger'],
      inputs: [joinPathFragments('{projectRoot}', options.output)],
      outputs: [joinPathFragments('{workspaceRoot}')],
    } as TargetConfiguration<OpenapiCodegenExecutorSchema>;
  }

  addProjectConfiguration(host, options.swaggerProject, project);

  return tasks;
}

async function generateCodegenProject(
  host: Tree,
  options: AddSwaggerJsonExecutorSchema & {
    codegenProject: string;
  },
): Promise<{ name: string; tasks: GeneratorCallback[] }> {
  const tasks: GeneratorCallback[] = [];
  const nameWithDirectory = `generated-${options.codegenProject}`;

  const nxJson = readNxJson(host);

  const {
    libraryGenerator,
  }: // eslint-disable-next-line @typescript-eslint/no-var-requires
  typeof import('@nx/js') = require('@nx/js');
  const libraryGeneratorDefaults = {
    ...nxJson?.generators?.['@nx/js:library'],
    ...nxJson?.generators?.['@nx/js']?.library,
  };
  tasks.push(
    await libraryGenerator(host, {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      ...libraryGeneratorDefaults,
      name: nameWithDirectory,
      directory: path.join('libs', 'generated', options.codegenProject),
      unitTestRunner: 'none',
    }),
  );
  await updateProjectConfiguration(
    host,
    nameWithDirectory,
    'unknown',
    (projectJson) => ({
      ...projectJson,
      targets: {
        ...projectJson?.targets,
        build: {
          executor: 'nx:noop',
          outputs: [joinPathFragments('{projectRoot}')],
        },
      },
      implicitDependencies: [options.swaggerProject ?? options.project],
    }),
  );

  updateNxJsonForCodegenTargets(host, options);

  return { name: nameWithDirectory, tasks };
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
  wc.targetDefaults['build'].dependsOn ??= ['^build'];
  wc.targetDefaults['build'].dependsOn = Array.from(
    new Set(wc.targetDefaults['build'].dependsOn.concat(newBuildDeps)),
  );

  if (major(NX_VERSION) >= 17) {
    wc.targetDefaults['codegen'] ??= {};
    wc.targetDefaults['codegen'].cache ??= true;
    wc.targetDefaults[options.target ?? 'swagger'] ??= {};
    wc.targetDefaults[options.target ?? 'swagger'].cache ??= true;
  }

  updateNxJson(host, wc);
}
