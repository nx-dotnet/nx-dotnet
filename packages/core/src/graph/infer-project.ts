import { TargetConfiguration } from '@nrwl/devkit';
import { appRootPath } from '@nrwl/tao/src/utils/app-root';
import { NxDotnetConfig, readConfig } from '@nx-dotnet/utils';

import { readFileSync } from 'fs';
import { dirname, resolve } from 'path';

import {
  GetBuildExecutorConfiguration,
  GetLintExecutorConfiguration,
  GetServeExecutorConfig,
  GetTestExecutorConfig,
} from '../models';

export const projectFilePatterns = ['*.csproj', '*.fsproj', '*.vbproj'];

export const registerProjectTargets = (projectFile: string) => {
  const { inferProjectTargets } = readConfig();
  const targets: Record<string, TargetConfiguration> = {};
  if (inferProjectTargets ?? true) {
    const projectFileContents = readFileSync(
      resolve(appRootPath, projectFile),
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
