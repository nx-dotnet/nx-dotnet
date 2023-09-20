import {
  ExecutorContext,
  logger,
  ProjectConfiguration,
  workspaceRoot,
} from '@nx/devkit';

import { dirname, resolve } from 'path';

import { DotNetClient, dotnetFactory } from '@nx-dotnet/dotnet';
import {
  getExecutedProjectConfiguration,
  getProjectFileForNxProject,
  iterateChildrenByPath,
  readConfig,
  readXml,
  readInstalledDotnetToolVersion,
} from '@nx-dotnet/utils';

import { buildStartupAssemblyPath } from '../../generators/utils/get-path-to-startup-assembly';
import { UpdateSwaggerJsonExecutorSchema } from './schema';
import { existsSync, mkdirSync } from 'fs';

export const SWAGGER_CLI_TOOL = 'Swashbuckle.AspNetCore.Cli';

function normalizeOptions(
  opts: Partial<UpdateSwaggerJsonExecutorSchema>,
  project: ProjectConfiguration,
  csProjFilePath: string,
  projectName: string,
): UpdateSwaggerJsonExecutorSchema {
  return {
    output: resolve(
      workspaceRoot,
      opts.output ?? `dist/swagger/${project.root}/swagger.json`,
    ),
    startupAssembly: opts.startupAssembly
      ? resolve(workspaceRoot, opts.startupAssembly)
      : resolve(buildStartupAssemblyPath(projectName, project, csProjFilePath)),

    swaggerDoc: opts.swaggerDoc ?? 'v1',
    skipInstall: opts.skipInstall ?? false,
  };
}

async function readSwashbuckleVersion(projectFilePath: string) {
  const configuredVersion =
    readConfig().nugetPackages?.['Swashbuckle.AspNetCore'];
  if (configuredVersion && configuredVersion !== 'ALLOW_MISMATCH') {
    return configuredVersion;
  }

  const xml = readXml(projectFilePath);
  let v: string | undefined;
  await iterateChildrenByPath(
    xml,
    'ItemGroup.PackageReference',
    async (reference) => {
      const pkg = reference.attr['Include'];
      const version = reference.attr['Version'];
      if (pkg === 'Swashbuckle.AspNetCore') {
        v = version;
      }
    },
  );
  if (!v) {
    throw new Error(
      'Unable to resolve Swashbuckle.AspNetCore for ' + projectFilePath,
    );
  }
  return v;
}

export default async function runExecutor(
  schema: Partial<UpdateSwaggerJsonExecutorSchema>,
  context: ExecutorContext,
  dotnetClient: DotNetClient = new DotNetClient(dotnetFactory(), workspaceRoot),
) {
  const nxProjectConfiguration = getExecutedProjectConfiguration(context);
  const csProjFilePath = await getProjectFileForNxProject(
    nxProjectConfiguration,
  );
  const projectDirectory = resolve(workspaceRoot, nxProjectConfiguration.root);
  dotnetClient.cwd = projectDirectory;
  const options = normalizeOptions(
    schema,
    nxProjectConfiguration,
    csProjFilePath,
    context.projectName as string,
  );

  const outputDirectory = dirname(options.output);
  if (!existsSync(outputDirectory)) {
    mkdirSync(outputDirectory, { recursive: true });
  }

  if (!options.skipInstall) {
    ensureSwaggerToolInstalled(
      context,
      dotnetClient,
      await readSwashbuckleVersion(csProjFilePath),
    );
  }

  dotnetClient.runTool('swagger', [
    'tofile',
    '--output',
    options.output,
    options.startupAssembly,
    options.swaggerDoc,
  ]);

  return {
    success: true,
  };
}

function ensureSwaggerToolInstalled(
  context: ExecutorContext,
  dotnetClient: DotNetClient,
  version: string,
) {
  const installedSwaggerVersion =
    readInstalledDotnetToolVersion(SWAGGER_CLI_TOOL);

  if (installedSwaggerVersion) {
    if (installedSwaggerVersion === version) {
      return;
    }
    logger.warn(
      `Swagger CLI was found, but the version "${installedSwaggerVersion}" does not match the expected version "${version}" of Swashbuckle.AspNetCore in ${context.projectName}. We reinstalled it such that the version matches, but you may want to review the changes made.`,
    );
  }

  dotnetClient.installTool(SWAGGER_CLI_TOOL, version);
}
