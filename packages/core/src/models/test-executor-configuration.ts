import { TargetConfiguration } from '@nrwl/devkit';

export function GetTestExecutorConfig(
  projectName?: string,
): TestTargetConfiguration {
  return {
    executor: '@nx-dotnet/core:test',
    options: {
      testProject: projectName,
    },
  };
}

export interface TestTargetConfiguration extends TargetConfiguration {
  options: {
    /**
     * If null, implicitly this must be the test project.
     * Else, run this target on the testProject instead of
     * the executor's target.
     */
    testProject?: string;
  };
}
