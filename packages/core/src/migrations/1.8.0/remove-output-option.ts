/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  logger,
  normalizePath,
  TargetConfiguration,
  Tree,
  updateProjectConfiguration,
} from '@nx/devkit';

import { basename, resolve } from 'path';
import { XmlDocument } from 'xmldoc';

import {
  getNxDotnetProjects,
  getProjectFileForNxProject,
} from '@nx-dotnet/utils';

import { BuildExecutorConfiguration } from '../../models';

export default async function removeOutputOption(host: Tree) {
  const projects = await getNxDotnetProjects(host);
  for (const [name, projectConfiguration] of projects.entries()) {
    const projectFile = await getProjectFileForNxProject(projectConfiguration);
    if (projectFile) {
      const xml = new XmlDocument(host.read(projectFile, 'utf-8') as string);
      const outputPath = xml
        .childNamed('PropertyGroup')
        ?.childNamed('OutputPath');

      if (!outputPath) {
        logger.warn(
          `Skipping ${name} because it does not have OutputPath set in ${basename(
            projectFile,
          )}`,
        );
        continue;
      }

      let xmlOutputPath = outputPath.val;
      xmlOutputPath = normalizePath(
        resolve(host.root, projectConfiguration.root, xmlOutputPath),
      );

      const buildTargets = findBuildTargets(projectConfiguration.targets || {});
      buildTargets.forEach((buildTarget) => {
        const shouldUpdate = updateBuildTargetOptions(
          host,
          name,
          buildTarget,
          xmlOutputPath,
        );
        if (shouldUpdate)
          updateProjectConfiguration(host, name, projectConfiguration);
      });
    }
  }
}

function updateBuildTargetOptions(
  host: Tree,
  projectName: string,
  configuration: BuildExecutorConfiguration,
  xmlOutputPath?: string,
) {
  const outputPath = normalizePath(
    resolve(host.root, configuration.options.output),
  );
  if (outputPath !== xmlOutputPath) {
    logger.info(
      `Skipping ${projectName} since .csproj OutputPath is set differently from --output parameter`,
    );
    logger.info(`-  .csproj OutputPath: ${xmlOutputPath}`);
    logger.info(`-  project.json output: ${outputPath}`);
    return false;
  }
  const output = configuration.options.output;
  const outputs = configuration.outputs || [];
  delete configuration.options.output;
  configuration.options['noIncremental'] = true;
  configuration.outputs = outputs.filter((x) => x !== '{options.output}');
  configuration.outputs.push(output);
  return true;
}

function findBuildTargets(
  targets: Record<string, TargetConfiguration>,
): BuildExecutorConfiguration[] {
  return Object.values(targets).filter(
    (configuration) => configuration.executor === '@nx-dotnet/core:build',
  ) as BuildExecutorConfiguration[];
}
