import {
  CreateNodesContext,
  CreateNodesFunction,
  CreateNodesV2,
  NxJsonConfiguration,
  ProjectConfiguration,
  TargetConfiguration,
  createNodesFromFiles,
  workspaceRoot,
} from '@nx/devkit';

import { readFileSync } from 'fs';
import { basename, dirname, extname, join } from 'path';

import { NxDotnetConfigV2, ResolvedConfig, readConfig } from '@nx-dotnet/utils';
import minimatch = require('minimatch');

import {
  analyzeProjects,
  getProjectAnalysis,
  ProjectAnalysis,
} from './msbuild-analyzer';

import {
  GetBuildExecutorConfiguration,
  GetLintExecutorConfiguration,
  GetServeExecutorConfig,
  GetTestExecutorConfig,
} from '../models';
import { FILTERED_PATH_PARTS } from '../generators/utils/generate-project';
import { getWorkspaceScope } from '../generators/utils/get-scope';
import type { PackageJson } from 'nx/src/utils/package-json';
import { tryReadJsonFile } from '../generators/utils/try-read-json';

export const projectFilePatterns = readConfig().inferProjects
  ? ['*.csproj', '*.fsproj', '*.vbproj']
  : [];

export function parseName(
  projectFile: string,
  nxJson: NxJsonConfiguration | null,
  rootPackageJson: PackageJson,
) {
  const workspaceScope = getWorkspaceScope(nxJson, rootPackageJson);
  const namespaceName = basename(projectFile, extname(projectFile)).replace(
    new RegExp(`^${workspaceScope}.`, 'i'),
    '',
  );

  const parentDirectories = dirname(projectFile)
    // eslint-disable-next-line no-useless-escape
    .split(/[\/\\]/g)
    .reverse();

  const maybeProjectNameParts = [];
  for (const part of parentDirectories) {
    maybeProjectNameParts.unshift(part);

    const maybeProjectName = maybeProjectNameParts.join('.');

    if (maybeProjectName === namespaceName) {
      return {
        name: namespaceName,
        scheme: 'dotnet',
      };
    }

    if (FILTERED_PATH_PARTS.has(part) || part === workspaceScope) {
      maybeProjectNameParts.shift();
      if (maybeProjectNameParts.some((part) => part.includes('.'))) {
        return {
          name: maybeProjectNameParts.map(titlecase).join('.'),
          scheme: 'dotnet',
        };
      }
      return {
        name: maybeProjectNameParts.map((s) => s.toLocaleLowerCase()).join('-'),
        scheme: 'nx',
      };
    }
  }

  return {
    name: maybeProjectNameParts.map((s) => s.toLocaleLowerCase()).join('-'),
    scheme: 'nx',
  };
}

export function createProjectDefinition(
  projectFile: string,
  projectFileContents: string,
  nxDotnetConfig: ResolvedConfig,
  nxJson: NxJsonConfiguration | null,
  rootPackageJson: PackageJson,
  analysisResult?: ProjectAnalysis,
):
  | (ProjectConfiguration & Required<Pick<ProjectConfiguration, 'root'>>)
  | null {
  const root = dirname(projectFile);
  const name = parseName(projectFile, nxJson, rootPackageJson).name;

  const targets: Record<string, TargetConfiguration> = {};
  const { inferredTargets } = nxDotnetConfig;
  if (inferredTargets === false) {
    return null;
  }

  // Use analyzer results if available, otherwise fall back to file contents
  const isTestProject = analysisResult
    ? analysisResult.packageReferences.some(
        (ref) => ref.Include === 'Microsoft.NET.Test.Sdk',
      )
    : projectFileContents.includes('Microsoft.NET.Test.Sdk');

  if (isTestProject && inferredTargets.test) {
    const { targetName, ...extraOptions } =
      typeof inferredTargets.test === 'string'
        ? { targetName: inferredTargets.test }
        : inferredTargets.test;
    targets[targetName] = {
      ...GetTestExecutorConfig(),
      ...extraOptions,
    };
  }
  if (inferredTargets.build) {
    const { targetName, ...extraOptions } =
      typeof inferredTargets.build === 'string'
        ? { targetName: inferredTargets.build }
        : inferredTargets.build;
    targets[targetName] = {
      ...GetBuildExecutorConfiguration(dirname(projectFile)),
      ...extraOptions,
    };
  }
  if (inferredTargets.lint) {
    const { targetName, ...extraOptions } =
      typeof inferredTargets.lint === 'string'
        ? { targetName: inferredTargets.lint }
        : inferredTargets.lint;
    targets[targetName] = {
      ...GetLintExecutorConfiguration(),
      ...extraOptions,
    };
  }
  if (inferredTargets.serve) {
    const { targetName, ...extraOptions } =
      typeof inferredTargets.serve === 'string'
        ? { targetName: inferredTargets.serve }
        : inferredTargets.serve;
    targets[targetName] = {
      ...GetServeExecutorConfig(),
      ...extraOptions,
    };
  }

  return {
    name,
    root,
    targets,
    tags: nxDotnetConfig.tags,
  };
}

export const registerProjectTargets = (
  projectFile: string,
  opts = readConfig(),
) => {
  // Try to get analyzer results from cache
  let analysisResult: ProjectAnalysis | undefined;
  try {
    analysisResult = getProjectAnalysis(projectFile);
  } catch (error) {
    // Analyzer not available or failed, will fall back to file contents
  }

  const project = createProjectDefinition(
    projectFile,
    readFileSync(join(workspaceRoot, projectFile), 'utf-8'),
    opts,
    tryReadJsonFile('nx.json') ?? {},
    tryReadJsonFile('package.json'),
    analysisResult,
  );
  return project?.targets ?? {};
};

// Between Nx versions 16.8 and 17, the signature of `CreateNodesFunction` changed.
// It used to only consist of the file and context, but now it also includes the options.
// The options were inserted as the second parameter, and the context was moved to the third.
// The following types are used to support both signatures.

type CreateNodesFunctionV16 = (
  file: string,
  ctx: Parameters<CreateNodesFunction>[2],
  _: undefined,
) => ReturnType<CreateNodesFunction>;

type CreateNodesFunctionCompat<T> = (
  p0:
    | Parameters<CreateNodesFunction<T>>[0]
    | Parameters<CreateNodesFunctionV16>[0],
  p1:
    | Parameters<CreateNodesFunction<T>>[1]
    | Parameters<CreateNodesFunctionV16>[1],
  p2:
    | Parameters<CreateNodesFunction<T>>[2]
    | Parameters<CreateNodesFunctionV16>[2],
) => ReturnType<CreateNodesFunction<T>>;

type CreateNodesCompat<T> = [string, CreateNodesFunctionCompat<T>];

export function isFileIgnored(
  file: string,
  options: NxDotnetConfigV2,
): boolean {
  return (
    !options.inferProjects ||
    (options.ignorePaths?.some((p) =>
      minimatch(file, p, {
        dot: true,
      }),
    ) ??
      false)
  );
}

export const createNodesV2: CreateNodesV2<NxDotnetConfigV2> = [
  `**/{${projectFilePatterns.join(',')}}`,
  (
    files,
    // We read the config in the function to ensure it's always up to date / compatible.
    opts,
    maybeCtx,
  ) => {
    const options = readConfig();

    // Filter out ignored files
    const projectFiles = files.filter((file) => !isFileIgnored(file, options));

    if (projectFiles.length === 0) {
      return [];
    }

    // Analyze all projects at once and cache the results
    try {
      analyzeProjects(projectFiles);
    } catch (error) {
      // If analyzer fails, fall back to file-based analysis
      console.warn('[nx-dotnet] msbuild-analyzer failed, falling back to file-based analysis:', error);
    }

    // Now use createNodesFromFiles which will use the cached results
    return createNodesFromFiles<NxDotnetConfigV2 | undefined>(
      createNodes[1],
      projectFiles,
      opts,
      maybeCtx,
    );
  },
];

// Used in Nx 16.8+
export const createNodes: CreateNodesCompat<NxDotnetConfigV2> = [
  `**/{${projectFilePatterns.join(',')}}`,
  (
    file: string,
    // We read the config in the function to ensure it's always up to date / compatible.
    ctxOrOpts: CreateNodesContext | NxDotnetConfigV2 | undefined,
    maybeCtx: CreateNodesContext | undefined,
  ) => {
    const options = readConfig();
    const context = maybeCtx ?? (ctxOrOpts as CreateNodesContext);

    if (isFileIgnored(file, options)) {
      return {};
    }

    // Try to get analyzer results from cache
    let analysisResult: ProjectAnalysis | undefined;
    try {
      analysisResult = getProjectAnalysis(file);
    } catch (error) {
      // Analyzer not available or failed, will fall back to file contents
    }

    const project = createProjectDefinition(
      file,
      readFileSync(join(context.workspaceRoot, file), 'utf-8'),
      options,
      context.nxJsonConfiguration,
      tryReadJsonFile(join(context.workspaceRoot, 'package.json')),
      analysisResult,
    );

    if (!project) {
      return {};
    }

    return {
      projects: {
        [project.root]: project,
      },
    };
  },
];

function titlecase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
