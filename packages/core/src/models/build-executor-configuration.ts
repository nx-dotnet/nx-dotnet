import { TargetConfiguration } from '@nrwl/devkit';

export function GetBuildExecutorConfiguration(
  projectName: string
): TargetConfiguration {
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
