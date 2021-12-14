import { TargetConfiguration } from '@nrwl/devkit';
import { BuildExecutorSchema } from '../executors/build/schema';

/**
 * Returns a TargetConfiguration for the nx-dotnet/core:build executor
 */
export function GetBuildExecutorConfiguration(
  projectRoot: string,
): BuildExecutorConfiguration {
  const outputDirectory = `dist/${projectRoot}`;

  return {
    executor: '@nx-dotnet/core:build',
    outputs: [outputDirectory],
    options: {
      configuration: 'Debug',
      noDependencies: true,
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
export type BuildExecutorConfiguration = TargetConfiguration & {
  executor: '@nx-dotnet/core:build';
  options: BuildExecutorSchema;
};
