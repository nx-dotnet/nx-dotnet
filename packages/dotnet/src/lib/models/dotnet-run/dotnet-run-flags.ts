import { CommandLineParamFixes } from '@nx-dotnet/utils';

export type dotnetRunFlags =
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

export const runCommandLineParamFixes: CommandLineParamFixes<dotnetRunFlags> = {
  keyMap: {
    noDependencies: 'no-dependencies',
    noRestore: 'no-restore',
    versionSuffix: 'version-suffix',
    noIncremental: 'no-incremental',
    configuration: 'property:Configuration',
  },
  explicitFalseKeys: [],
};
