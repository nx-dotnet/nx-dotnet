import {
  addProjectConfiguration,
  formatFiles,
  getWorkspaceLayout,
  names,
  NxJsonProjectConfiguration,
  ProjectConfiguration,
  ProjectType,
  readProjectConfiguration,
  readWorkspaceConfiguration,
  Tree,
} from '@nrwl/devkit';

import { readFileSync, writeFileSync } from 'fs';
import { dirname, relative } from 'path';
import { XmlDocument, XmlNode, XmlTextNode } from 'xmldoc';

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
  NxDotnetTestGeneratorSchema,
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
  projectType: ProjectType;
}

export function normalizeOptions(
  host: Tree,
  options: NxDotnetProjectGeneratorSchema | NxDotnetTestGeneratorSchema,
  projectType?: ProjectType,
): NormalizedSchema {
  if (!('name' in options)) {
    // Reconstruct the original parameters as if the test project were generated at the same time as the target project.
    const project = readProjectConfiguration(host, options.project);
    const projectPaths = project.root.split('/');
    const directory = projectPaths.slice(1, -1).join('/'); // The middle portions contain the original path.
    const [name] = projectPaths.slice(-1); // The final folder contains the original name.

    options = {
      name,
      language: options.language,
      skipOutputPathManipulation: options.skipOutputPathManipulation,
      testTemplate: options.testTemplate,
      directory,
      tags: project.tags?.join(','),
      template: '',
      standalone: options.standalone,
    };
    projectType = project.projectType;
  }

  const name = names(options.name).fileName;
  const className = names(options.name).className;
  const projectDirectory = options.directory
    ? `${names(options.directory).fileName}/${name}`
    : name;
  const projectName = projectDirectory.replace(new RegExp('/', 'g'), '-');
  const projectRoot = `${
    projectType === 'application'
      ? getWorkspaceLayout(host).appsDir
      : getWorkspaceLayout(host).libsDir
  }/${projectDirectory}`;
  const parsedTags = options.tags
    ? options.tags.split(',').map((s) => s.trim())
    : [];
  parsedTags.push(NXDOTNET_TAG);

  const npmScope = names(readWorkspaceConfiguration(host).npmScope).className;
  const featureScope = projectDirectory
    .split(/\/|\\/gm) // Without the unnecessary parentheses, the separator is excluded from the result array.
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
    projectType: projectType ?? 'library',
  };
}

export function SetOutputPath(
  host: Tree,
  projectRootPath: string,
  projectFilePath: string,
): void {
  const xml: XmlDocument = new XmlDocument(
    readFileSync(projectFilePath).toString(),
  );

  let outputPath = `${relative(
    dirname(projectFilePath),
    process.cwd(),
  )}/dist/${projectRootPath}`;
  outputPath = outputPath.replace('\\', '/'); // Forward slash works on windows, backslash does not work on mac/linux

  const textNode: Partial<XmlTextNode> = {
    text: outputPath,
    type: 'text',
  };
  textNode.toString = () => textNode.text ?? '';
  textNode.toStringWithIndent = () => textNode.text ?? '';

  const el: Partial<XmlNode> = {
    name: 'OutputPath',
    attr: {},
    type: 'element',
    children: [textNode as XmlTextNode],
    firstChild: null,
    lastChild: null,
  };

  el.toStringWithIndent = xml.toStringWithIndent.bind(el);
  el.toString = xml.toString.bind(el);

  xml.childNamed('PropertyGroup')?.children.push(el as XmlNode);

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
  } else if (!options.skipOutputPathManipulation) {
    SetOutputPath(
      host,
      normalizedOptions.projectRoot,
      await findProjectFileInPath(normalizedOptions.projectRoot),
    );
  }

  await formatFiles(host);
}

export function addDryRunParameter(parameters: dotnetNewOptions): void {
  parameters.push({
    flag: 'dryRun',
    value: true,
  });
}
