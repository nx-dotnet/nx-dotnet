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

export const buildKeyMap: Partial<{ [key in dotnetBuildFlags]: string }> = {
  noRestore: 'no-restore',
  noIncremental: 'no-incremental',
  noDependencies: 'no-dependencies',
  versionSuffix: 'version-suffix',
};
