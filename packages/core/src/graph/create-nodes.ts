import { CreateNodes, TargetConfiguration, workspaceRoot } from '@nx/devkit';

import { readFileSync } from 'fs';
import { dirname, resolve } from 'path';

import { readConfig } from '@nx-dotnet/utils';

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

// Used in Nx 16.8+
export const createNodes: CreateNodes | undefined = readConfig().inferProjects
  ? [
      `{${projectFilePatterns.join(',')}}`,
      (file) => {
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
              targets,
              tags: ['nx-dotnet'],
            },
          },
        };
      },
    ]
  : undefined;
