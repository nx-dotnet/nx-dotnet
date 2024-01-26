import { TargetConfiguration } from '@nx/devkit';
import { TestExecutorSchema } from '../executors/test/schema';

export function GetTestExecutorConfig(
  projectName?: string,
): TestTargetConfiguration {
  return {
    executor: '@nx-dotnet/core:test',
    cache: true,
    dependsOn: ['build'],
    options: {
      testProject: projectName,
      noBuild: true,
    },
  };
}

export type TestTargetConfiguration = TargetConfiguration & {
  executor: '@nx-dotnet/core:test';
  options: TestExecutorSchema;
};
