import {
  addProjectConfiguration,
  formatFiles,
  getWorkspaceLayout,
  names,
  Tree,
} from '@nrwl/devkit';
import { NxDotnetGeneratorSchema } from './schema';
import { DotNetClient, dotnetFactory, dotnetNewOptions } from '@nx-dotnet/dotnet';
import { isDryRun } from '@nx-dotnet/utils';

interface NormalizedSchema extends NxDotnetGeneratorSchema {
  projectName: string;
  projectRoot: string;
  projectDirectory: string;
  projectLanguage: string;
  projectTemplate: string;
  parsedTags: string[];
}

function normalizeOptions(
  host: Tree,
  options: NxDotnetGeneratorSchema
): NormalizedSchema {
  const name = names(options.name).fileName;
  const projectDirectory = options.directory
    ? `${names(options.directory).fileName}/${name}`
    : name;
  const projectName = projectDirectory.replace(new RegExp('/', 'g'), '-');
  const projectRoot = `${getWorkspaceLayout(host).appsDir}/${projectDirectory}`;
  const parsedTags = options.tags
    ? options.tags.split(',').map((s) => s.trim())
    : [];

  return {
    ...options,
    name,
    projectName,
    projectRoot,
    projectDirectory,
    parsedTags,
    projectLanguage: options.language,
    projectTemplate: options.template,
  };
}

export default async function (host: Tree, options: NxDotnetGeneratorSchema, dotnetClient = new DotNetClient(dotnetFactory())) {
  const normalizedOptions = normalizeOptions(host, options);
  addProjectConfiguration(host, normalizedOptions.projectName, {
    root: normalizedOptions.projectRoot,
    projectType: 'application',
    sourceRoot: `${normalizedOptions.projectRoot}`,
    targets: {
      build: {
        executor: '@nx-dotnet/core:build',
        options: {
          output: `dist/${normalizedOptions.name}`,
          configuration: 'Debug'
        },
        configurations: {
          production: {
            configuration: 'Release'
          }
        }
      },
      test: {
        executor: '@nx-dotnet/core:test',
      },
    },
    tags: normalizedOptions.parsedTags,
  });

  const newParams: dotnetNewOptions = [
    {
      flag: 'language',
      value: normalizedOptions.language,
    },
    {
      flag: 'name',
      value: normalizedOptions.name,
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

  await formatFiles(host);
}
