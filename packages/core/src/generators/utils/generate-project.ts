import {
  addProjectConfiguration,
  formatFiles,
  getWorkspaceLayout,
  joinPathFragments,
  names,
  normalizePath,
  ProjectConfiguration,
  ProjectType,
  readWorkspaceConfiguration,
  Tree,
} from '@nrwl/devkit';
import { workspaceRoot } from 'nx/src/utils/app-root';

//  Files generated via `dotnet` are not available in the virtual fs
import { readFileSync, writeFileSync } from 'fs';
import { dirname, relative } from 'path';
import { XmlDocument } from 'xmldoc';

import {
  DotNetClient,
  dotnetNewOptions,
  KnownDotnetTemplates,
} from '@nx-dotnet/dotnet';
import { findProjectFileInPath, isDryRun, resolve } from '@nx-dotnet/utils';

import {
  GetBuildExecutorConfiguration,
  GetLintExecutorConfiguration,
  GetServeExecutorConfig,
  NxDotnetProjectGeneratorSchema,
} from '../../models';
import initSchematic from '../init/generator';
import { GenerateTestProject } from './generate-test-project';
import { addToSolutionFile } from './add-to-sln';
import { promptForTemplate } from './prompt-for-template';
import generateSwaggerSetup from '../add-swagger-target/add-swagger-target';

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
  const name = names(options.name).fileName;
  const className = names(options.name).className;
  const projectDirectory = options.directory
    ? `${names(options.directory).fileName}/${name}`
    : name;
  const projectName = projectDirectory.replace(/\//g, '-');
  const projectRoot = `${
    (projectType || options.projectType) === 'application'
      ? getWorkspaceLayout(host).appsDir
      : getWorkspaceLayout(host).libsDir
  }/${projectDirectory}`;
  const parsedTags = options.tags
    ? options.tags.split(',').map((s) => s.trim())
    : [];

  const template = client
    ? await promptForTemplate(client, options.template, options.language)
    : options.template;

  const npmScope = names(
    readWorkspaceConfiguration(host).npmScope || '',
  ).className;
  const featureScope = projectDirectory
    // not sure why eslint complains here, testing in devtools shows different results without the escape character.
    // eslint-disable-next-line no-useless-escape
    .split(/[\/\\]/gm) // Without the unnecessary parentheses, the separator is excluded from the result array.
    .map((part: string) => names(part).className);
  const namespaceName = [npmScope, ...featureScope].join('.');

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

export async function manipulateXmlProjectFile(
  host: Tree,
  options: Pick<NormalizedSchema, 'projectRoot' | 'projectName'>,
): Promise<void> {
  const projectFilePath = await findProjectFileInPath(options.projectRoot);

  const xml: XmlDocument = new XmlDocument(
    readFileSync(projectFilePath).toString(),
  );

  setOutputPath(xml, options.projectRoot, projectFilePath);
  addPrebuildMsbuildTask(host, options, xml);

  writeFileSync(projectFilePath, xml.toString());
}

export async function GenerateProject(
  host: Tree,
  options: NxDotnetProjectGeneratorSchema,
  dotnetClient: DotNetClient,
  projectType: ProjectType,
) {
  await initSchematic(host, null, dotnetClient);

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

  if (!options.skipOutputPathManipulation && !isDryRun()) {
    await manipulateXmlProjectFile(host, normalizedOptions);
  }

  if (normalizedOptions.template === 'webapi') {
    generateSwaggerSetup(host, {
      project: normalizedOptions.projectName,
      swaggerProject: `${normalizedOptions.projectName}-swagger`,
    });
  }

  await formatFiles(host);
}

export function setOutputPath(
  xml: XmlDocument,
  projectRootPath: string,
  projectFilePath: string,
) {
  let outputPath = joinPathFragments(
    relative(dirname(projectFilePath), workspaceRoot),
    'dist',
    projectRootPath,
  );
  outputPath = normalizePath(outputPath); // Forward slash works on windows, backslash does not work on mac/linux

  const fragment = new XmlDocument(`<OutputPath>${outputPath}</OutputPath>`);
  xml.childNamed('PropertyGroup')?.children.push(fragment);
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
