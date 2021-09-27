export interface TestExecutorSchema {
  testAdapterPath?: string;
  blame?: boolean;
  blameCrash?: boolean;
  blameCrashDumpType?: string;
  blameCrashCollectAlways?: boolean;
  blameHang?: boolean;
  blameHangDumpType?: string;
  blameHangTimeout?: string;
  configuration?: string;
  collect?: string;
  diag?: string;
  framework?: string;
  filter?: string;
  logger?: string;
  noBuild?: boolean;
  noRestore?: boolean;
  output?: string;
  resultsDirectory?: string;
  runtime?: string;
  settings?: string;
  listTests?: boolean;
  verbosity?:
    | 'quiet'
    | 'q'
    | 'm'
    | 'minimal'
    | 'n'
    | 'normal'
    | 'd'
    | 'detailed'
    | 'diag'
    | 'diagnostic';
  watch?: boolean;
}
