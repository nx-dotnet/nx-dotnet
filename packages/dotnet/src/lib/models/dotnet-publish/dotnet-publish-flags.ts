export type dotnetPublishFlags =
  | 'configuration'
  | 'framework'
  | 'force'
  | 'manifest'
  | 'noBuild'
  | 'noDependencies'
  | 'noRestore'
  | 'nologo'
  | 'output'
  | 'runtime'
  | 'selfContained'
  | 'noSelfContained'
  | 'verbosity'
  | 'versionSuffix';

export const publishKeyMap: Partial<{ [key in dotnetPublishFlags]: string }> = {
  noBuild: 'no-build',
  noDependencies: 'no-dependencies',
  noRestore: 'no-restore',
  selfContained: 'self-contained',
  noSelfContained: 'no-self-contained',
  versionSuffix: 'version-suffix',
};
