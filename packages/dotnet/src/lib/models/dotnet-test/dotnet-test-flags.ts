export type dotnetTestFlags =
  | 'blameCrashCollectAlways'
  | 'blameCrashDumpType'
  | 'blameCrash'
  | 'blameHangDump'
  | 'blameHangTimeout'
  | 'blameHang'
  | 'blame'
  | 'collect'
  | 'configuration'
  | 'diag'
  | 'filter'
  | 'framework'
  | 'listTests'
  | 'logger'
  | 'noBuild'
  | 'noRestore'
  | 'nologo'
  | 'resultsDirectory'
  | 'settings'
  | 'testAdapterPath'
  | 'verbosity';

export const testKeyMap: Partial<{ [key in dotnetTestFlags]: string }> = {
  blameCrashCollectAlways: 'blame-crash-collect-always',
  blameCrash: 'blame-crash',
  blameCrashDumpType: 'blame-crash-dump-type',
  blameHangDump: 'blame-hang-dump',
  blameHang: 'blame-hang',
  blameHangTimeout: 'blame-hang-timeout',
  listTests: 'list-tests',
  noBuild: 'no-build',
  noRestore: 'no-restore',
  resultsDirectory: 'results-directory',
  testAdapterPath: 'test-adapter-path',
};
