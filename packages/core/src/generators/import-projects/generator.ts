import {
  addProjectConfiguration,
  formatFiles,
  getProjects,
  getWorkspaceLayout,
  joinPathFragments,
  logger,
  names,
  ProjectConfiguration,
  TargetConfiguration,
  Tree,
} from '@nx/devkit';

import { basename, dirname } from 'path';
import { XmlDocument } from 'xmldoc';

import { DotNetClient, dotnetFactory } from '@nx-dotnet/dotnet';
import { glob, iterateChildrenByPath, projPattern } from '@nx-dotnet/utils';

import {
  GetBuildExecutorConfiguration,
  GetLintExecutorConfiguration,
  GetServeExecutorConfig,
  GetTestExecutorConfig,
} from '../../models';
import { initGenerator } from '../init/generator';

export default async function (
  host: Tree,
  options: null, // The second option is provided at runtime by Nx for options passed in to the generator.
  dotnetClient = new DotNetClient(dotnetFactory()),
) {
  const installTask = await initGenerator(host, null, dotnetClient);

  const projectFiles = await getProjectFilesInWorkspace(host);
  const existingProjectJsonDirectories = getDirectoriesWithProjectJson(host);
  for (const projectFile of projectFiles.newLibs) {
    if (
      !existingProjectJsonDirectories.some((x) =>
        projectFile.startsWith(x + '/'),
      )
    ) {
      await addNewDotnetProject(host, projectFile, false);
      logger.log('Found new library', projectFile);
    }
  }
  for (const projectFile of projectFiles.newApps) {
    if (
      !existingProjectJsonDirectories.some((x) =>
        projectFile.startsWith(x + '/'),
      )
    ) {
      await addNewDotnetProject(host, projectFile, true);
      logger.log('Found new application', projectFile);
    }
  }
  return async () => {
    await installTask();
    await formatFiles(host);
  };
}

async function addNewDotnetProject(
  host: Tree,
  projectFile: string,
  app: boolean,
) {
  const rootNamespace = readRootNamespace(host, projectFile);
  const projectRoot = dirname(projectFile);
  const projectName = rootNamespace
    ? names(rootNamespace).fileName.replace(/\./g, '-')
    : names(basename(projectRoot)).fileName;
  const configuration: ProjectConfiguration & {
    targets: Record<string, TargetConfiguration>;
  } = {
    root: projectRoot,
    targets: {
      build: GetBuildExecutorConfiguration(projectRoot),
      lint: GetLintExecutorConfiguration(),
    },
    projectType: app ? 'application' : 'library',
  };
  const testProject = await checkIfTestProject(host, projectFile);
  if (app && !testProject) {
    configuration.targets.serve = GetServeExecutorConfig();
  }
  if (testProject) {
    configuration.targets.test = GetTestExecutorConfig();
  }
  addProjectConfiguration(host, projectName, configuration);
}

async function getProjectFilesInWorkspace(host: Tree) {
  const { appsDir, libsDir } = getWorkspaceLayout(host);
  const newProjects = {
    newLibs: await glob(projPattern(libsDir)),
    newApps: [] as string[],
  };
  if (libsDir !== appsDir) {
    newProjects.newApps = await glob(projPattern(appsDir));
  }
  return newProjects;
}

function readRootNamespace(host: Tree, path: string): string | undefined {
  const xml = new XmlDocument(host.read(path)?.toString() as string);
  return xml.valueWithPath('PropertyGroup.RootNamespace');
}

async function checkIfTestProject(host: Tree, path: string): Promise<boolean> {
  const xml = new XmlDocument(host.read(path)?.toString() as string);
  let isTestProject = false;
  await iterateChildrenByPath(xml, 'ItemGroup.PackageReference', (el) => {
    const pkg = el.attr['Include'];
    if (pkg === 'Microsoft.NET.Test.Sdk') {
      isTestProject = true;
    }
  });
  return isTestProject;
}
function getDirectoriesWithProjectJson(host: Tree) {
  const nxProjects = getProjects(host);
  const collected: string[] = [];
  for (const proj of nxProjects.values()) {
    if (host.exists(joinPathFragments(proj.root, 'project.json'))) {
      collected.push(proj.root);
    }
  }
  return collected;
}
