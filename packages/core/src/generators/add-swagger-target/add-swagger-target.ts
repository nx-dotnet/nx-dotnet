import {
  addProjectConfiguration,
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
  NX_VERSION,
  TargetConfiguration,
  getProjects,
  createProjectGraphAsync,
} from '@nx/devkit';

import { getSwaggerExecutorConfiguration } from '../../models/swagger-executor-configuration';
import { AddSwaggerJsonExecutorSchema } from './schema';
import { major } from 'semver';
import { OpenapiCodegenExecutorSchema } from '../../executors/openapi-codegen/schema';

export default async function generateSwaggerSetup(
  host: Tree,
  options: AddSwaggerJsonExecutorSchema,
) {
  const tasks: GeneratorCallback[] = [];
  const project = await findCsProjProject(
    host,
    options.project,
    options.projectRoot,
  );
  project.targets ??= {};
  if (!options.output) {
    if (options.swaggerProject) {
      options.output = joinPathFragments(
        swaggerProjectRoot(host, options.swaggerProject),
        'swagger.json',
      );
      const shellTasks = await generateShellProject(host, {
        ...options,
        swaggerProject: options.swaggerProject,
        project: options.project,
        codegenProject: options.codegenProject,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        output: options.output!,
      });
      tasks.push(...shellTasks);
    } else {
      throw new Error('Either specify --output or --swagger-project');
    }
  }

  project.targets[options.target ?? 'swagger'] = {
    ...getSwaggerExecutorConfiguration(options.output),
  };

  updateProjectConfiguration(host, options.project, project);

  return async () => {
    for (const task of tasks) {
      await task();
    }
  };
}

async function findCsProjProject(
  host: Tree,
  projectName: string,
  projectRoot?: string,
): Promise<ProjectConfiguration> {
  const allProjects = getProjects(host);
  const project = allProjects.get(projectName);
  // Project is already present in the tree, awesome.
  if (project) {
    return project;
  }
  const graph = await createProjectGraphAsync();
  if (graph.nodes[projectName]) {
    return graph.nodes[projectName].data;
  }
  if (projectRoot) {
    addProjectConfiguration(host, projectName, { root: projectRoot });
    return { root: projectRoot };
  }
  throw new Error(`Project ${projectName} not found`);
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
  options: AddSwaggerJsonExecutorSchema & {
    swaggerProject: string;
    output: string;
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
      await generateCodegenProject(host, options);

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
  options: AddSwaggerJsonExecutorSchema,
): Promise<{ name: string; tasks: GeneratorCallback[] }> {
  const tasks: GeneratorCallback[] = [];
  const nameWithDirectory = `generated-${options.codegenProject}`;

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
  wc.targetDefaults['build'].dependsOn ??= [];
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
