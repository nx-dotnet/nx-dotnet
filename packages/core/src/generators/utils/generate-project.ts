import {
  addProjectConfiguration,
  formatFiles,
  GeneratorCallback,
  getWorkspaceLayout,
  joinPathFragments,
  names,
  normalizePath,
  ProjectConfiguration,
  ProjectType,
  readWorkspaceConfiguration,
  Tree,
} from '@nrwl/devkit';

//  Files generated via `dotnet` are not available in the virtual fs
import { relative } from 'path';
import { XmlDocument } from 'xmldoc';

import {
  DotNetClient,
  dotnetNewOptions,
  KnownDotnetTemplates,
} from '@nx-dotnet/dotnet';
import { isDryRun, resolve } from '@nx-dotnet/utils';

import {
  GetBuildExecutorConfiguration,
  GetLintExecutorConfiguration,
  GetServeExecutorConfig,
  NxDotnetProjectGeneratorSchema,
} from '../../models';
import generateSwaggerSetup from '../add-swagger-target/add-swagger-target';
import { initGenerator } from '../init/generator';
import { addToSolutionFile } from './add-to-sln';
import { GenerateTestProject } from './generate-test-project';
import { promptForTemplate } from './prompt-for-template';

export interface NormalizedSchema
  extends Omit<NxDotnetProjectGeneratorSchema, 'template'> {
  projectName: string;
  projectRoot: string;
  projectDirectory: string;
  projectLanguage: string;
  projectTemplate: KnownDotnetTemplates;
  parsedTags: string[];
  className: string;
  namespaceName: string;
  projectType?: ProjectType;
}

export async function normalizeOptions(
  host: Tree,
  options: NxDotnetProjectGeneratorSchema,
  client?: DotNetClient,
  projectType?: ProjectType,
): Promise<NormalizedSchema> {
  const name = getNameFromSchema(options);
  const className = names(options.name).className;
  const projectDirectory = options.directory
    ? `${names(options.directory).fileName}/${name}`
    : name;
  const projectName = getProjectNameFromSchema(options, projectDirectory);
  const projectRoot = getProjectRootFromSchema(
    host,
    options,
    projectDirectory,
    projectType,
  );
  const parsedTags = getProjectTagsFromSchema(options);
  const template = await getTemplate(options, client);
  const namespaceName = getNamespaceFromSchema(host, options, projectDirectory);

  return {
    ...options,
    name,
    className,
    projectName,
    projectRoot,
    projectDirectory,
    parsedTags,
    projectLanguage: options.language,
    projectTemplate: template as KnownDotnetTemplates,
    namespaceName,
    projectType: projectType ?? options.projectType ?? 'library',
  };
}

function getNameFromSchema(options: NxDotnetProjectGeneratorSchema): string {
  return options.pathScheme === 'nx'
    ? names(options.name).fileName
    : options.name;
}

function getNamespaceFromSchema(
  host: Tree,
  options: NxDotnetProjectGeneratorSchema,
  projectDirectory: string,
): string {
  const npmScope = names(
    readWorkspaceConfiguration(host).npmScope || '',
  ).className;
  const featureScope = projectDirectory
    // not sure why eslint complains here, testing in devtools shows different results without the escape character.
    // eslint-disable-next-line no-useless-escape
    .split(/[\/\\]/gm) // Without the unnecessary parentheses, the separator is excluded from the result array.
    .map((part: string) => names(part).className);

  return [npmScope, ...featureScope].join('.');
}

async function getTemplate(
  options: NxDotnetProjectGeneratorSchema,
  client?: DotNetClient,
): Promise<string> {
  let template = options.template || '';
  if (client) {
    template = await promptForTemplate(
      client,
      options.template,
      options.language,
    );
  }

  return template;
}

function getProjectTagsFromSchema(
  options: NxDotnetProjectGeneratorSchema,
): string[] {
  return options.tags ? options.tags.split(',').map((s) => s.trim()) : [];
}

function getProjectRootFromSchema(
  host: Tree,
  options: NxDotnetProjectGeneratorSchema,
  projectDirectory: string,
  projectType?: string,
): string {
  const workspaceLayoutRoot =
    (projectType || options.projectType) === 'application'
      ? getWorkspaceLayout(host).appsDir
      : getWorkspaceLayout(host).libsDir;

  return workspaceLayoutRoot
    ? joinPathFragments(workspaceLayoutRoot, projectDirectory)
    : projectDirectory;
}

function getProjectNameFromSchema(
  options: NxDotnetProjectGeneratorSchema,
  projectDirectory: string,
): string {
  if (options.pathScheme === 'dotnet') {
    return options.directory
      ? `${names(options.directory).className}.${options.name}`
      : options.name;
  }

  return projectDirectory.replace(/\//g, '-');
}

export async function GenerateProject(
  host: Tree,
  options: NxDotnetProjectGeneratorSchema,
  dotnetClient: DotNetClient,
  projectType: ProjectType,
) {
  const tasks: GeneratorCallback[] = [
    await initGenerator(host, null, dotnetClient),
  ];

  options.testTemplate = options.testTemplate ?? 'none';

  const normalizedOptions = await normalizeOptions(
    host,
    options,
    dotnetClient,
    projectType,
  );

  const projectConfiguration: ProjectConfiguration = {
    root: normalizedOptions.projectRoot,
    projectType: projectType,
    sourceRoot: `${normalizedOptions.projectRoot}`,
    targets: {
      build: GetBuildExecutorConfiguration(normalizedOptions.projectRoot),
      ...(projectType === 'application'
        ? { serve: GetServeExecutorConfig() }
        : {}),
      lint: GetLintExecutorConfiguration(),
    },
    tags: normalizedOptions.parsedTags,
  };

  addProjectConfiguration(
    host,
    normalizedOptions.projectName,
    projectConfiguration,
    normalizedOptions.standalone,
  );

  const newParams: dotnetNewOptions = {
    language: normalizedOptions.language,
    name: normalizedOptions.namespaceName,
    output: normalizedOptions.projectRoot,
  };

  if (isDryRun()) {
    newParams['dryRun'] = true;
  }

  dotnetClient.new(normalizedOptions.projectTemplate, newParams);
  if (!isDryRun()) {
    addToSolutionFile(
      host,
      projectConfiguration.root,
      dotnetClient,
      normalizedOptions.solutionFile,
    );
  }

  if (options['testTemplate'] !== 'none') {
    await GenerateTestProject(host, normalizedOptions, dotnetClient);
  }

  if (
    normalizedOptions.projectTemplate === 'webapi' &&
    !normalizedOptions.skipSwaggerLib
  ) {
    tasks.push(
      await generateSwaggerSetup(host, {
        project: normalizedOptions.projectName,
        swaggerProject: `${normalizedOptions.projectName}-swagger`,
        codegenProject: `${normalizedOptions.projectName}-types`,
        useNxPluginOpenAPI: normalizedOptions.useNxPluginOpenAPI,
      }),
    );
  }

  createGitIgnore(host, normalizedOptions.projectRoot);

  await formatFiles(host);

  return async () => {
    for (const task of tasks) {
      await task();
    }
  };
}

function createGitIgnore(host: Tree, projectRoot: string) {
  const gitIgnorePath = normalizePath(
    joinPathFragments(projectRoot, '.gitignore'),
  );

  host.write(gitIgnorePath, `[Bb]in/\n[Oo]bj/`);
}

export function addPrebuildMsbuildTask(
  host: Tree,
  options: { projectRoot: string; projectName: string },
  xml: XmlDocument,
) {
  const scriptPath = normalizePath(
    relative(
      options.projectRoot,
      resolve('@nx-dotnet/core/src/tasks/check-module-boundaries'),
    ),
  );

  const fragment = new XmlDocument(`
    <Target Name="CheckNxModuleBoundaries" BeforeTargets="Build">
      <Exec Command="node ${scriptPath} -p ${options.projectName}"/>
    </Target>
  `);

  xml.children.push(fragment);
}
