export interface NugetReferenceGeneratorSchema {
  project: string;
  packageName: string;
  version?: string;
  framework?: string;
  packageDirectory?: string;
  prerelease?: boolean;
  source?: string;
  noRestore?: boolean;
}
