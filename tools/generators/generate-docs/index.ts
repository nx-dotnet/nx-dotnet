import {
  Tree,
  formatFiles,
  installPackagesTask,
  getProjects,
  ProjectConfiguration,
  NxJsonProjectConfiguration,
  generateFiles,
  names,
  readJson,
} from '@nrwl/devkit';
import { libraryGenerator } from '@nrwl/workspace/generators';
import * as path from 'path';
import { ExecutorsCollection, GeneratorsCollection } from './schema-json.interface';

export default async function (host: Tree, schema: any) {
  const projects = await findProjectsWithGeneratorsOrExecutors(host);
  projects.forEach((p) => {
    const generators = readJson<GeneratorsCollection>(host, `${p.root}/generators.json`);
    const executors = readJson<ExecutorsCollection>(host, `${p.root}/executors.json`);
    generateFiles(host, path.join(__dirname, 'templates'), `docs`, {
      projectFileName: names(p.name).fileName,
      project: p,
      generators: generators.generators,
      executors: executors.executors
    });
  });
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
