import { ModuleBoundaries } from './nx';

export interface NxDotnetConfig {
  /**
   * Map of package -> version, used for Single Version Principle.
   */
  nugetPackages: {
    [key: string]: string | undefined;
  };
  moduleBoundaries?: ModuleBoundaries;
}
