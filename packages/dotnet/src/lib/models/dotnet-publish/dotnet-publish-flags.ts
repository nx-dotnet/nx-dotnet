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

export const publishKeyMap: Partial<{ [key in dotnetPublishFlags]: string }> = {
  noBuild: 'no-build',
  noDependencies: 'no-dependencies',
  noRestore: 'no-restore',
  selfContained: 'self-contained',
  versionSuffix: 'version-suffix',
};
