import {
  addProjectConfiguration,
  formatFiles,
  getProjects,
  getWorkspaceLayout,
  names,
  NxJsonProjectConfiguration,
  ProjectConfiguration,
  TargetConfiguration,
  Tree,
} from '@nrwl/devkit';

import { basename, dirname } from 'path';
import { XmlDocument } from 'xmldoc';

import { glob, iterateChildrenByPath, NXDOTNET_TAG } from '@nx-dotnet/utils';

import {
  GetBuildExecutorConfiguration,
  GetLintExecutorConfiguration,
  GetServeExecutorConfig,
  GetTestExecutorConfig,
} from '../../models';
import { manipulateXmlProjectFile } from '../utils/generate-project';

export default async function (host: Tree) {
  const projectFiles = await getProjectFilesInWorkspace(host);
  const existingProjectRoots = Array.from(getProjects(host).values()).map(
    (x) => x.root,
  );
  for (const projectFile of projectFiles.newLibs) {
    if (!existingProjectRoots.some((x) => projectFile.startsWith(x))) {
      await addNewDotnetProject(host, projectFile, false);
      console.log('Found new library', projectFile);
    }
  }
  for (const projectFile of projectFiles.newApps) {
    if (!existingProjectRoots.some((x) => projectFile.startsWith(x))) {
      await addNewDotnetProject(host, projectFile, true);
      console.log('Found new application', projectFile);
    }
  }
  return formatFiles(host);
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
  const configuration: ProjectConfiguration &
    NxJsonProjectConfiguration & {
      targets: Record<string, TargetConfiguration>;
    } = {
    root: projectRoot,
    targets: {
      build: GetBuildExecutorConfiguration(projectRoot),
      lint: GetLintExecutorConfiguration(),
    },
    tags: [NXDOTNET_TAG],
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
  await manipulateXmlProjectFile(host, {
    projectName,
    projectRoot,
  });
}

async function getProjectFilesInWorkspace(host: Tree) {
  const { appsDir, libsDir } = getWorkspaceLayout(host);
  const newProjects = {
    newLibs: await glob(`${libsDir}/**/*.@(cs|fs|vb)proj`),
    newApps: [] as string[],
  };
  if (libsDir !== appsDir) {
    newProjects.newApps = await glob(`${appsDir}/**/*.@(cs|fs|vb)proj`);
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
