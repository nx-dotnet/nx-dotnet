import { TargetConfiguration } from '@nx/devkit';

export function GetLintExecutorConfiguration(): TargetConfiguration {
  return {
    executor: '@nx-dotnet/core:format',
    cache: true,
    inputs: ['{projectRoot}/**/*.{cs,fs,vb}'],
  };
}
