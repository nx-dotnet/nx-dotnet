import { ModuleBoundaries } from './nx';

export interface NxDotnetConfig {
  /**
   * Map of package -> version, used for Single Version Principle.
   */
  nugetPackages: {
    [key: string]: string | undefined;
  };

  /**
   * Setup module boundary definitions here if not using eslint
   */
  moduleBoundaries?: ModuleBoundaries;

  /**
   * Default solution file
   */
  solutionFile?: string;

  /**
   * Set to false to skip target inference
   * @default true
   */
  inferProjectTargets?: boolean;

  /**
   * Set to false to skip project inference
   * @default true
   */
  inferProjects?: boolean;
}
