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

export const runKeyMap: Partial<{ [key in dotnetRunFlags]: string }> = {
  noDependencies: 'no-dependencies',
  noRestore: 'no-restore',
  versionSuffix: 'version-suffix',
  noIncremental: 'no-incremental',
};
