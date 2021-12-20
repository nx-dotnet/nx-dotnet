import { TargetConfiguration } from '@nrwl/devkit';
import { readFileSync } from 'fs';
import { dirname } from 'path';
import {
  GetBuildExecutorConfiguration,
  GetLintExecutorConfiguration,
  GetServeExecutorConfig,
  GetTestExecutorConfig,
} from '../models';

export const projectFilePatterns = ['*.csproj', '*.fsproj', '*.vbproj'];

export const registerProjectTargets = (projectFile: string) => {
  const targets: Record<string, TargetConfiguration> = {};
  const projectFileContents = readFileSync(projectFile, 'utf8');
  if (projectFileContents.includes('Microsoft.NET.Test.Sdk')) {
    targets['test'] = GetTestExecutorConfig();
  }
  targets['build'] = GetBuildExecutorConfiguration(dirname(projectFile));
  targets['lint'] = GetLintExecutorConfiguration();
  targets['serve'] = GetServeExecutorConfig();
  return targets;
};
