export interface BuildExecutorSchema {
  framework?: string;
  versionSuffix: number;
  configuration: 'Debug' | 'Release';
}
