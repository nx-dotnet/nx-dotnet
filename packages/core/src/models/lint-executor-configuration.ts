import { TargetConfiguration } from '@nrwl/devkit';

export function GetLintExecutorConfiguration(): TargetConfiguration {
  return {
    executor: '@nx-dotnet/core:format',
  };
}
