import { TargetConfiguration } from '@nrwl/devkit';

/**
 * Returns a TargetConfiguration for the nx-dotnet/core:build executor
 */
export function GetBuildExecutorConfiguration(
  projectRoot: string
): BuildExecutorConfiguration {
  const outputDirectory = `dist/${projectRoot}`;

  return {
    executor: '@nx-dotnet/core:build',
    outputs: ['{options.output}'],
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

/**
 * Configuration options relevant for the build executor
 */
export interface BuildExecutorConfiguration extends TargetConfiguration {
  options: {
    output: string;
    configuration: 'Debug' | 'Release';
  };
}
