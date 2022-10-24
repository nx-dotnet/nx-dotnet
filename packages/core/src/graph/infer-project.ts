import { TargetConfiguration, workspaceRoot } from '@nrwl/devkit';

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
