import {
  CreateNodesContext,
  CreateNodesFunction,
  TargetConfiguration,
  workspaceRoot,
} from '@nx/devkit';

import { readFileSync } from 'fs';
import { dirname, resolve } from 'path';

import {
  DefaultConfigValues,
  NxDotnetConfig,
  readConfig,
} from '@nx-dotnet/utils';

import {
  GetBuildExecutorConfiguration,
  GetLintExecutorConfiguration,
  GetServeExecutorConfig,
  GetTestExecutorConfig,
} from '../models';

export const projectFilePatterns = readConfig().inferProjects
  ? ['*.csproj', '*.fsproj', '*.vbproj']
  : [];

export const registerProjectTargets = (projectFile: string) => {
  const targets: Record<string, TargetConfiguration> = {};
  const { inferProjectTargets } = readConfig();
  if (inferProjectTargets ?? true) {
    const projectFileContents = readFileSync(
      resolve(workspaceRoot, projectFile),
      'utf8',
    );
    if (projectFileContents.includes('Microsoft.NET.Test.Sdk')) {
      targets['test'] = GetTestExecutorConfig();
    }
    targets['build'] = GetBuildExecutorConfiguration(dirname(projectFile));
    targets['lint'] = GetLintExecutorConfiguration();
    targets['serve'] = GetServeExecutorConfig();
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
export const createNodes: CreateNodesCompat<NxDotnetConfig> = [
  `**/{${projectFilePatterns.join(',')}}`,
  (
    file: string,
    ctxOrOpts: CreateNodesContext | NxDotnetConfig | undefined,
    maybeCtx: CreateNodesContext | undefined,
  ) => {
    const options: NxDotnetConfig =
      ((maybeCtx ? ctxOrOpts : readConfig()) as NxDotnetConfig) ??
      DefaultConfigValues;

    if (!options.inferProjects) {
      return {};
    }

    const root = dirname(file);

    // eslint-disable-next-line no-useless-escape -- eslint's wrong
    const parts = root.split(/[\/\\]/g);
    const name = parts[parts.length - 1].toLowerCase();

    const targets = registerProjectTargets(file);

    return {
      projects: {
        [name]: {
          name,
          root,
          type: 'lib',
          targets: options.inferProjectTargets ? targets : undefined,
          tags: ['nx-dotnet'],
        },
      },
    };
  },
];
