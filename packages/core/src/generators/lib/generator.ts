import {
  addProjectConfiguration,
  formatFiles,
  generateFiles,
  getWorkspaceLayout,
  names,
  offsetFromRoot,
  Tree,
} from '@nrwl/devkit';
import { execSync } from 'child_process';
import * as path from 'path';
import { NxDotnetGeneratorSchema } from './schema';

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
  const projectRoot = `${getWorkspaceLayout(host).libsDir}/${projectDirectory}`;
  const parsedTags = options.tags
    ? options.tags.split(',').map((s) => s.trim())
    : [];

  return {
    ...options,
    projectName,
    projectRoot,
    projectDirectory,
    parsedTags,
    projectLanguage: options.language,
    projectTemplate: options.template,
  };
}

export default async function (host: Tree, options: NxDotnetGeneratorSchema) {
  const normalizedOptions = normalizeOptions(host, options);
  addProjectConfiguration(host, normalizedOptions.projectName, {
    root: normalizedOptions.projectRoot,
    projectType: 'library',
    sourceRoot: `${normalizedOptions.projectRoot}/src`,
    targets: {
      build: {
        executor: '@nx-dotnet/core:build',
      },
    },
    tags: normalizedOptions.parsedTags,
  });
  execSync(
    `dotnet new ${normalizedOptions.template} --language ${normalizedOptions.language} --name ${normalizedOptions.projectName} --output ${normalizedOptions.projectRoot}`
  );
  await formatFiles(host);
}
