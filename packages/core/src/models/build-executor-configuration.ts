import { NX_VERSION, TargetConfiguration } from '@nx/devkit';
import { lt } from 'semver';
import { BuildExecutorSchema } from '../executors/build/schema';

/**
 * Returns a TargetConfiguration for the nx-dotnet/core:build executor
 */
export function GetBuildExecutorConfiguration(
  projectRoot: string,
): BuildExecutorConfiguration {
  // eslint-disable-next-line @typescript-eslint/no-var-requires

  const outputs = lt(NX_VERSION, '15.0.0-beta.0')
    ? [`dist/${projectRoot}`, `dist/intermediates/${projectRoot}`]
    : [
        `{workspaceRoot}/dist/${projectRoot}`,
        `{workspaceRoot}/dist/intermediates/${projectRoot}`,
      ];

  return {
    executor: '@nx-dotnet/core:build',
    outputs,
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
