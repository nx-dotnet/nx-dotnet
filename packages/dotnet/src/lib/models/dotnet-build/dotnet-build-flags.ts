import { CommandLineParamFixes } from '@nx-dotnet/utils';

export type dotnetBuildFlags =
  | 'configuration'
  | 'framework'
  | 'force'
  | 'noDependencies'
  | 'noIncremental'
  | 'noRestore'
  | 'nologo'
  | 'output'
  | 'source'
  | 'verbosity'
  | 'versionSuffix'
  | 'runtime';

export const buildCommandLineParamFixes: CommandLineParamFixes<dotnetBuildFlags> =
  {
    keyMap: {
      noRestore: 'no-restore',
      noIncremental: 'no-incremental',
      noDependencies: 'no-dependencies',
      versionSuffix: 'version-suffix',
    },
    explicitFalseKeys: [],
  };
