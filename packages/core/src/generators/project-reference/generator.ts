import {
  addProjectConfiguration,
  formatFiles,
  generateFiles,
  getWorkspaceLayout,
  names,
  offsetFromRoot,
  readProjectConfiguration,
  Tree,
  updateProjectConfiguration,
} from '@nrwl/devkit';
import { execSync } from 'child_process';
import * as path from 'path';
import { DotNetClient, dotnetFactory } from '../../core';
import { getProjectFileForNxProject } from '../../utils/workspace';
import { NxDotnetGeneratorSchema } from './schema';

interface NormalizedSchema extends NxDotnetGeneratorSchema {
  projectName: string;
  projectRoot: string;
  projectDirectory: string;
  projectLanguage: string;
  projectTemplate: string;
  parsedTags: string[];
}

export default async function (host: Tree, options: NxDotnetGeneratorSchema, client = new DotNetClient(dotnetFactory())) {
  const hostProject = readProjectConfiguration(host, options.project)
  const sourceProject = readProjectConfiguration(host, options.reference);
  const [hostProjectFile, sourceProjectFile] = await Promise.all([
    getProjectFileForNxProject(hostProject),
    getProjectFileForNxProject(sourceProject),
  ]);
  client.addProjectReference(hostProjectFile, sourceProjectFile);

  hostProject.implicitDependencies = hostProject.implicitDependencies || [];
  hostProject.implicitDependencies.push(options.reference);
  updateProjectConfiguration(host, options.project, hostProject);

  await formatFiles(host);
}
