export interface ServeExecutorSchema {
  configuration?: string;
  framework?: string;
  force?: boolean;
  'launch-profile'?: string;
  'no-launch-profile'?: boolean;
  runtime?: string;
  verbosity?:
    | 'quiet'
    | 'minimal'
    | 'normal'
    | 'detailed'
    | 'diagnostic'
    | 'q'
    | 'm'
    | 'n'
    | 'd'
    | 'diag';
  watch: boolean;
}
