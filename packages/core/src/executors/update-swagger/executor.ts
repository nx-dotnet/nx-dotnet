import {
  ExecutorContext,
  logger,
  ProjectConfiguration,
  readJsonFile,
  workspaceRoot,
} from '@nrwl/devkit';

import { existsSync } from 'fs';
import { ensureDirSync } from 'fs-extra';
import { dirname, join } from 'path';

import { DotNetClient, dotnetFactory } from '@nx-dotnet/dotnet';
import {
  getExecutedProjectConfiguration,
  getProjectFileForNxProject,
  iterateChildrenByPath,
  readConfig,
  readXml,
} from '@nx-dotnet/utils';

import { buildStartupAssemblyPath } from '../../generators/utils/get-path-to-startup-assembly';
import { UpdateSwaggerJsonExecutorSchema } from './schema';

export const SWAGGER_CLI_TOOL = 'Swashbuckle.AspNetCore.Cli';

function normalizeOptions(
  opts: Partial<UpdateSwaggerJsonExecutorSchema>,
  project: ProjectConfiguration,
  csProjFilePath: string,
  projectName: string,
): UpdateSwaggerJsonExecutorSchema {
  return {
    output: opts.output ?? `dist/swagger/${project.root}/swagger.json`,
    startupAssembly:
      opts.startupAssembly ??
      buildStartupAssemblyPath(projectName, project, csProjFilePath),
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

  const options = normalizeOptions(
    schema,
    nxProjectConfiguration,
    csProjFilePath,
    context.projectName as string,
  );
  ensureDirSync(dirname(options.output));

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
  const manifestPath = join(workspaceRoot, './.config/dotnet-tools.json');
  const manifest = existsSync(manifestPath)
    ? readJsonFile(manifestPath)
    : undefined;

  if (manifest?.tools[SWAGGER_CLI_TOOL] === version) {
    return;
  } else if (manifest?.tools[SWAGGER_CLI_TOOL]) {
    logger.warn(
      `Swagger CLI was found, but the version does not match the version of Swashbuckle.AspNetCore in ${context.projectName}. We reinstalled it such that the version matches, but you may want to review the changes made.`,
    );
  }

  dotnetClient.installTool(SWAGGER_CLI_TOOL, version);
}
