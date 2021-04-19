import { TargetConfiguration } from '@nrwl/devkit';

export function GetServeExecutorConfig(
): TargetConfiguration {
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
