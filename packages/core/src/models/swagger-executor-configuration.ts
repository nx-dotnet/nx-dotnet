import { TargetConfiguration } from '@nrwl/devkit';

import { UpdateSwaggerJsonExecutorSchema } from '../executors/update-swagger/schema';

/**
 * Returns a TargetConfiguration for the nx-dotnet/core:build executor
 */
export function getSwaggerExecutorConfiguration(
  outputDirectory: string,
): SwaggerExecutorConfiguration {
  return {
    executor: '@nx-dotnet/core:update-swagger',
    outputs: ['options.output'],
    options: {
      output: outputDirectory,
    },
  };
}

/**
 * Configuration options relevant for the build executor
 */
export type SwaggerExecutorConfiguration = TargetConfiguration & {
  executor: '@nx-dotnet/core:update-swagger';
  options: Partial<UpdateSwaggerJsonExecutorSchema>;
};
