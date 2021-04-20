import {
  addProjectConfiguration,
  formatFiles,
  getWorkspaceLayout,
  names,
  NxJsonProjectConfiguration,
  ProjectConfiguration,
  ProjectType,
  TargetConfiguration,
  Tree,
} from '@nrwl/devkit';

import {
  DotNetClient,
  dotnetFactory,
  dotnetNewOptions,
} from '@nx-dotnet/dotnet';
import { findProjectFileInPath, isDryRun } from '@nx-dotnet/utils';
import {
  GetBuildExecutorConfiguration,
  GetServeExecutorConfig,
  GetTestExecutorConfig,
  NxDotnetProjectGeneratorSchema,
} from '../../models';

import initSchematic from '../init/generator';

interface NormalizedSchema extends NxDotnetProjectGeneratorSchema {
  projectName: string;
  projectRoot: string;
  projectDirectory: string;
  projectLanguage: string;
  projectTemplate: string;
  parsedTags: string[];
  className: string;
}

function normalizeOptions(
  host: Tree,
  options: NxDotnetProjectGeneratorSchema,
  projectType: ProjectType
): NormalizedSchema {
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
  };
}

async function GenerateTestProject(
  schema: NormalizedSchema,
  host: Tree,
  dotnetClient: DotNetClient,
  projectType: ProjectType
) {
  const testName = schema.name + '-test';
  const testRoot = schema.projectRoot + '-test';
  const testProjectName = schema.projectName + '-test';

  addProjectConfiguration(host, testProjectName, {
    root: testRoot,
    projectType: projectType,
    sourceRoot: `${testRoot}`,
    targets: {
      build: GetBuildExecutorConfiguration(testName),
      test: GetTestExecutorConfig()
    },
    tags: schema.parsedTags,
  });

  const newParams: dotnetNewOptions = [
    {
      flag: 'language',
      value: schema.language,
    },
    {
      flag: 'name',
      value: schema.className + '.Test',
    },
    {
      flag: 'output',
      value: schema.projectRoot + '-test',
    },
  ];

  if (isDryRun()) {
    newParams.push({
      flag: 'dry-run',
    });
  }

  dotnetClient.new(schema['test-template'], newParams);
  
  if (!isDryRun()) {
    const testCsProj = await findProjectFileInPath(testRoot);
    const baseCsProj = await findProjectFileInPath(schema.projectRoot);
    dotnetClient.addProjectReference(testCsProj, baseCsProj);
  } 

}

export async function GenerateProject (
  host: Tree,
  options: NxDotnetProjectGeneratorSchema,
  dotnetClient = new DotNetClient(dotnetFactory()),
  projectType: ProjectType
) {
  initSchematic(host);

  const normalizedOptions = normalizeOptions(host, options, projectType);

  const projectConfiguration: ProjectConfiguration & NxJsonProjectConfiguration = {
    root: normalizedOptions.projectRoot,
    projectType: projectType,
    sourceRoot: `${normalizedOptions.projectRoot}`,
    targets: {
      build: GetBuildExecutorConfiguration(normalizedOptions.name),
      serve: GetServeExecutorConfig()
    },
    tags: normalizedOptions.parsedTags,
  }

  if (options['test-template'] !== 'none') {
    projectConfiguration.targets.test = GetTestExecutorConfig(normalizedOptions.projectName + '-test') 
  }

  addProjectConfiguration(host, normalizedOptions.projectName, projectConfiguration);

  const newParams: dotnetNewOptions = [
    {
      flag: 'language',
      value: normalizedOptions.language,
    },
    {
      flag: 'name',
      value: normalizedOptions.className,
    },
    {
      flag: 'output',
      value: normalizedOptions.projectRoot,
    },
  ];

  if (isDryRun()) {
    newParams.push({
      flag: 'dry-run',
    });
  }

  dotnetClient.new(normalizedOptions.template, newParams);

  if (options['test-template'] !== 'none') {
    await GenerateTestProject(normalizedOptions, host, dotnetClient, projectType);
  }

  await formatFiles(host);
}
