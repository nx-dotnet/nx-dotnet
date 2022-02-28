import { TargetConfiguration } from '@nrwl/devkit';
import { appRootPath } from '@nrwl/tao/src/utils/app-root';

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
  const targets: Record<string, TargetConfiguration> = {};
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
  return targets;
};
