import {
  ExecutorsJson,
  formatFiles,
  generateFiles,
  GeneratorsJson,
  getProjects,
  names,
  ProjectConfiguration,
  readJson,
  Tree,
} from '@nx/devkit';

import { readFileSync } from 'fs';
import * as path from 'node:path';

import { Schema } from './schema';
import { SchemaJSON } from './schema-json.interface';

type PackageDetail = {
  packageName: string;
  projectFileName: string;
  project: Omit<ProjectConfiguration, 'generators'>;
  generators: number;
  executors: number;
};

export default async function (host: Tree, options: Schema) {
  const projects = await findProjectsWithGeneratorsOrExecutors(host);

  const packageDetails: PackageDetail[] = [];

  options.exclude ??= [];
  const excludedProjects = Array.isArray(options.exclude)
    ? options.exclude
    : options.exclude.split(',');

  for (const project of projects) {
    if (excludedProjects.includes(project.name)) {
      continue;
    }

    packageDetails.push(generateDocsForProject(options, project, host));
  }

  generateFiles(
    host,
    path.join(__dirname, 'templates/root'),
    options.outputDirectory,
    {
      packageDetails,
      includeFrontMatter: !options.skipFrontMatter,
    },
  );

  if (!options.skipFormat) {
    await formatFiles(host);
  }
}

function generateDocsForProject(
  options: Schema,
  project: { name: string; generators: boolean; executors: boolean } & Omit<
    ProjectConfiguration,
    'generators'
  >,
  host: Tree,
): PackageDetail {
  let gettingStartedFile: string | null = options.gettingStartedFile.replace(
    '<src>',
    project.root,
  );
  if (options.verboseLogging) {
    console.log('Loading getting started file:', gettingStartedFile);
  }
  gettingStartedFile = host.exists(gettingStartedFile)
    ? gettingStartedFile
    : null;
  if (!gettingStartedFile && options.verboseLogging) {
    console.log('Getting started file not found');
  }

  const generatorsCollection: GeneratorsJson = project.generators
    ? readJson<GeneratorsJson>(host, `${project.root}/generators.json`)
    : ({} as GeneratorsJson);
  const generators = Object.fromEntries(
    Object.entries(generatorsCollection.generators ?? {}).filter(
      ([, config]) => !config.hidden,
    ),
  );

  const executorsCollection: ExecutorsJson = project.executors
    ? readJson<ExecutorsJson>(host, `${project.root}/executors.json`)
    : ({} as ExecutorsJson);
  const executors = Object.fromEntries(
    Object.entries(executorsCollection.executors ?? {}).filter(
      ([, config]) =>
        !(config as Required<GeneratorsJson>['generators'][string]).hidden,
    ),
  );

  const packageName = readJson(host, `${project.root}/package.json`).name;
  const projectFileName = names(project.name).fileName;

  generateFiles(
    host,
    path.join(__dirname, 'templates/index'),
    options.outputDirectory,
    {
      projectFileName,
      packageName,
      project,
      generators,
      executors,
      underscore: '_',
      gettingStartedMd: gettingStartedFile
        ? readFileSync(gettingStartedFile).toString()
        : '',
      frontMatter: options.skipFrontMatter
        ? null
        : {
            title: `${packageName}`,
            summary: `${packageName}`,
          },
    },
  );

  for (const [generatorName, config] of Object.entries(generators)) {
    const generatorFileName = names(generatorName).fileName;
    const schema = readJson<SchemaJSON>(
      host,
      path.relative(process.cwd(), path.resolve(project.root, config.schema)),
    );
    generateFiles(
      host,
      path.join(__dirname, 'templates/detail'),
      `${options.outputDirectory}/${projectFileName}/generators`,
      {
        projectFileName,
        project,
        generatorName,
        generatorFileName,
        schema,
        packageName,
      },
    );
  }

  Object.entries(executors).forEach(([generatorName, config]) => {
    const generatorFileName = names(generatorName).fileName;
    const schema = readJson<SchemaJSON>(
      host,
      path.relative(process.cwd(), path.resolve(project.root, config.schema)),
    );
    generateFiles(
      host,
      path.join(__dirname, 'templates/detail'),
      `${options.outputDirectory}/${projectFileName}/executors`,
      {
        projectFileName,
        project,
        generatorName,
        generatorFileName,
        schema,
        packageName,
      },
    );
  });

  return {
    packageName,
    projectFileName,
    project,
    generators: Object.keys(generators).length,
    executors: Object.keys(executors).length,
  };
}

export async function findProjectsWithGeneratorsOrExecutors(host: Tree) {
  const projects: ({
    name: string;
    generators: boolean;
    executors: boolean;
  } & Omit<ProjectConfiguration, 'generators'>)[] = [];
  getProjects(host).forEach((configuration, project) => {
    const res = projectContainsGeneratorsOrExecutors(host, configuration);
    if (res) {
      projects.push({
        ...configuration,
        name: project,
        ...res,
      });
    }
  });
  return projects;
}

export function projectContainsGeneratorsOrExecutors(
  host: Tree,
  project: ProjectConfiguration,
): false | { generators: boolean; executors: boolean } {
  const executors = host.isFile(`${project.root}/executors.json`);
  const generators = host.isFile(`${project.root}/generators.json`);
  return !(executors || generators) ? false : { generators, executors };
}
