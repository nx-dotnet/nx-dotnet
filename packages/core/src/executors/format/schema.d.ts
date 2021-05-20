export interface FormatExecutorSchema {
  noRestore?: boolean;
  fixWhitespace?: boolean;
  fixStyle?: string;
  diagnostics?: string | string[];
  include?: string[];
  exclude?: string[];
  check: boolean;
  report?: string;
  binarylog?: string;
  verbosity:
    | 'q'
    | 'quiet'
    | 'm'
    | 'minimal'
    | 'n'
    | 'normal'
    | 'd'
    | 'detailed'
    | 'diag'
    | 'diagnostic';
  fix?: boolean;
}
