import { CommandLineParamFixes } from '@nx-dotnet/utils';

export type dotnetPublishFlags =
  | 'configuration'
  | 'framework'
  | 'force'
  | 'manifest'
  | 'noBuild'
  | 'noDependencies'
  | 'nologo'
  | 'noRestore'
  | 'output'
  | 'selfContained'
  | 'runtime'
  | 'verbosity'
  | 'versionSuffix';

export const publishCommandLineParamFixes: CommandLineParamFixes<dotnetPublishFlags> =
  {
    keyMap: {
      noBuild: 'no-build',
      noDependencies: 'no-dependencies',
      noRestore: 'no-restore',
      selfContained: 'self-contained',
      versionSuffix: 'version-suffix',
    },
    explicitFalseKeys: [],
  };
