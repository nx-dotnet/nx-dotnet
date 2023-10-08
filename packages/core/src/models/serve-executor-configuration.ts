import { TargetConfiguration } from '@nx/devkit';

export function GetServeExecutorConfig(): ServeTargetConfiguration {
  return {
    executor: '@nx-dotnet/core:serve',
    options: {
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
 * Target configuration for nx-dotnet/core:serve
 */
export interface ServeTargetConfiguration extends TargetConfiguration {
  options: {
    configuration: 'Debug' | 'Release';
  };
}
