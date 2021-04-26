import { TargetConfiguration } from '@nrwl/devkit';

export function GetBuildExecutorConfiguration(
  projectName: string
): BuildExecutorConfiguration {
  const outputDirectory = `dist/${projectName}`;

  return {
    executor: '@nx-dotnet/core:build',
    outputs: [outputDirectory],
    options: {
      output: outputDirectory,
      configuration: 'Debug',
    },
    configurations: {
      production: {
        configuration: 'Release',
      },
    },
  };
}

export interface BuildExecutorConfiguration extends TargetConfiguration {
  options: {
    output: string;
    configuration: 'Debug' | 'Release';
  };
}
