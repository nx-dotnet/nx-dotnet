import {
  CreateNodesContext,
  CreateNodesFunction,
  TargetConfiguration,
  workspaceRoot,
} from '@nx/devkit';

import { readFileSync } from 'fs';
import { dirname, resolve } from 'path';

import { NxDotnetConfigV2, readConfig } from '@nx-dotnet/utils';
import minimatch = require('minimatch');

import {
  GetBuildExecutorConfiguration,
  GetLintExecutorConfiguration,
  GetServeExecutorConfig,
  GetTestExecutorConfig,
} from '../models';

export const projectFilePatterns = readConfig().inferProjects
  ? ['*.csproj', '*.fsproj', '*.vbproj']
  : [];

export const registerProjectTargets = (
  projectFile: string,
  opts = readConfig(),
) => {
  const targets: Record<string, TargetConfiguration> = {};
  const { inferredTargets } = opts;
  if (inferredTargets !== false) {
    const projectFileContents = readFileSync(
      resolve(workspaceRoot, projectFile),
      'utf8',
    );
    if (
      projectFileContents.includes('Microsoft.NET.Test.Sdk') &&
      inferredTargets.test
    ) {
      targets[inferredTargets.test] = GetTestExecutorConfig();
    }
    if (inferredTargets.build) {
      targets[inferredTargets.build] = GetBuildExecutorConfiguration(
        dirname(projectFile),
      );
    }
    if (inferredTargets.lint) {
      targets[inferredTargets.lint] = GetLintExecutorConfiguration();
    }
    if (inferredTargets.serve) {
      targets[inferredTargets.serve] = GetServeExecutorConfig();
    }
  }
  return targets;
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

// Used in Nx 16.8+
export const createNodes: CreateNodesCompat<NxDotnetConfigV2> = [
  `**/{${projectFilePatterns.join(',')}}`,
  (
    file: string,
    ctxOrOpts: CreateNodesContext | NxDotnetConfigV2 | undefined,
    maybeCtx: CreateNodesContext | undefined,
  ) => {
    const options = readConfig();

    if (
      !options.inferProjects ||
      options.ignorePaths.some((p) =>
        minimatch(file, p, {
          dot: true,
        }),
      )
    ) {
      return {};
    }

    const root = dirname(file);

    // eslint-disable-next-line no-useless-escape -- eslint's wrong
    const parts = root.split(/[\/\\]/g);
    const name = parts[parts.length - 1].toLowerCase();

    return {
      projects: {
        [name]: {
          name,
          root,
          type: 'lib',
          targets: registerProjectTargets(file, options),
          tags: options.tags,
        },
      },
    };
  },
];
