export interface Schema {
  outputDirectory: string;
  skipFrontMatter: boolean;
  skipFormat: boolean;
  gettingStartedFile: string;
  verboseLogging: boolean;
  exclude: string | string[];
}
