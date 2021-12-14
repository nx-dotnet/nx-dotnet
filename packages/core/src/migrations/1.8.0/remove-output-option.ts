/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  joinPathFragments,
  logger,
  normalizePath,
  TargetConfiguration,
  Tree,
  updateProjectConfiguration,
} from '@nrwl/devkit';
import {
  getNxDotnetProjects,
  getProjectFileForNxProject,
} from '@nx-dotnet/utils';
import { basename, relative, resolve } from 'path';
import { XmlDocument } from 'xmldoc';
import { BuildExecutorConfiguration } from '../../models';

export default async function update(host: Tree) {
  const projects = getNxDotnetProjects(host);
  for (const [name, projectConfiguration] of projects.entries()) {
    const projectFile = await getProjectFileForNxProject(projectConfiguration);
    if (projectFile) {
      const xml = new XmlDocument((host.read(projectFile) ?? '').toString());
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

      const buildTarget = Object.entries(
        (projectConfiguration.targets ??= {}),
      ).find(
        ([, configuration]) =>
          configuration.executor === '@nx-dotnet/core:build',
      );

      if (buildTarget) {
        const [target, { options }] = buildTarget as [
          string,
          BuildExecutorConfiguration,
        ];
        const outputPath = normalizePath(resolve(host.root, options.output));
        if (outputPath !== xmlOutputPath) {
          logger.info(
            `Skipping ${name} since .csproj OutputPath is set differently from --output parameter`,
          );
          logger.info(`-  .csproj OutputPath: ${xmlOutputPath}`);
          logger.info(`-  project.json output: ${outputPath}`);
          continue;
        } else {
          const t: BuildExecutorConfiguration = projectConfiguration.targets[
            target
          ] as BuildExecutorConfiguration;
          const output = t.options.output;
          const outputs = t.outputs || [];
          delete t.options.output;
          t.options['noIncremental'] = 'true';
          projectConfiguration.targets[target].outputs = outputs.filter(
            (x) => x !== '{options.output}',
          );
          (projectConfiguration.targets[target].outputs || []).push(output);
        }
        updateProjectConfiguration(host, name, projectConfiguration);
      }
    }
  }
}
