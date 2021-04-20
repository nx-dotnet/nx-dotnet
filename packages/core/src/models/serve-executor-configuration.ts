import { TargetConfiguration } from '@nrwl/devkit';

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

export interface ServeTargetConfiguration extends TargetConfiguration {
  options: {
    configuration: 'Debug' | 'Release';
  };
}
