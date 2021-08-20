import {
  addProjectConfiguration,
  formatFiles,
  getWorkspaceLayout,
  names,
  normalizePath,
  NxJsonProjectConfiguration,
  ProjectConfiguration,
  ProjectType,
  readWorkspaceConfiguration,
  Tree,
} from '@nrwl/devkit';

//  Files generated via `dotnet` are not available in the virtual fs
import { readFileSync, writeFileSync } from 'fs';

import { dirname, relative } from 'path';
import { XmlDocument } from 'xmldoc';

import { DotNetClient, dotnetNewOptions } from '@nx-dotnet/dotnet';
import {
  findProjectFileInPath,
  isDryRun,
  NXDOTNET_TAG,
} from '@nx-dotnet/utils';

import {
  GetBuildExecutorConfiguration,
  GetLintExecutorConfiguration,
  GetServeExecutorConfig,
  NxDotnetProjectGeneratorSchema,
} from '../../models';
import initSchematic from '../init/generator';
import { GenerateTestProject } from './generate-test-project';

export interface NormalizedSchema extends NxDotnetProjectGeneratorSchema {
  projectName: string;
  projectRoot: string;
  projectDirectory: string;
  projectLanguage: string;
  projectTemplate: string;
  parsedTags: string[];
  className: string;
  namespaceName: string;
  projectType?: ProjectType;
}

export function normalizeOptions(
  host: Tree,
  options: NxDotnetProjectGeneratorSchema,
  projectType?: ProjectType,
): NormalizedSchema {
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
  parsedTags.push(NXDOTNET_TAG);

  const npmScope = names(readWorkspaceConfiguration(host).npmScope).className;
  const featureScope = projectDirectory
    // not sure why eslint complains here, testing in devtools shows different results without the escape character.
    // eslint-disable-next-line no-useless-escape
    .split(/[\/\\]/gm) // Without the unnecessary parentheses, the separator is excluded from the result array.
    .map((part) => names(part).className);
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
    projectTemplate: options.template,
    namespaceName,
    projectType: projectType ?? options.projectType ?? 'library',
  };
}

export async function manipulateXmlProjectFile(
  host: Tree,
  options: NormalizedSchema,
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

  const normalizedOptions = normalizeOptions(host, options, projectType);

  const projectConfiguration: ProjectConfiguration &
    NxJsonProjectConfiguration = {
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

  const newParams: dotnetNewOptions = [
    {
      flag: 'language',
      value: normalizedOptions.language,
    },
    {
      flag: 'name',
      value: normalizedOptions.namespaceName,
    },
    {
      flag: 'output',
      value: normalizedOptions.projectRoot,
    },
  ];

  if (isDryRun()) {
    addDryRunParameter(newParams);
  }

  dotnetClient.new(normalizedOptions.template, newParams);

  if (options['testTemplate'] !== 'none') {
    await GenerateTestProject(host, normalizedOptions, dotnetClient);
  }

  if (!options.skipOutputPathManipulation && !isDryRun()) {
    await manipulateXmlProjectFile(host, normalizedOptions);
  }

  await formatFiles(host);
}

export function addDryRunParameter(parameters: dotnetNewOptions): void {
  parameters.push({
    flag: 'dryRun',
    value: true,
  });
}

export function setOutputPath(
  xml: XmlDocument,
  projectRootPath: string,
  projectFilePath: string,
) {
  let outputPath = `${relative(
    dirname(projectFilePath),
    process.cwd(),
  )}/dist/${projectRootPath}`;
  outputPath = outputPath.replace('\\', '/'); // Forward slash works on windows, backslash does not work on mac/linux

  const fragment = new XmlDocument(`<OutputPath>${outputPath}</OutputPath>`);
  xml.childNamed('PropertyGroup')?.children.push(fragment);
}

export function addPrebuildMsbuildTask(
  host: Tree,
  options: { projectRoot: string; name: string },
  xml: XmlDocument,
) {
  const scriptPath = normalizePath(
    relative(
      options.projectRoot,
      require.resolve('@nx-dotnet/core/src/tasks/check-module-boundaries'),
    ),
  );

  const fragment = new XmlDocument(`
    <Target Name="CheckNxModuleBoundaries" BeforeTargets="Build">
      <Exec Command="node ${scriptPath} -p ${options.name}"/>
    </Target>
  `);

  xml.children.push(fragment);
}
