import { TargetConfiguration } from '@nx/devkit';
import { ModuleBoundaries } from './nx';

export interface NxDotnetConfigV1 {
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

type PluginTargetConfiguration = TargetConfiguration & {
  targetName: string;
};

type ConfiguredTargets = {
  build: PluginTargetConfiguration | string | false;
  lint: PluginTargetConfiguration | string | false;
  serve: PluginTargetConfiguration | string | false;
  test: PluginTargetConfiguration | string | false;
};

export type NxDotnetConfigV2 = Omit<NxDotnetConfigV1, 'inferProjectTargets'> & {
  /**
   * Set to false to skip target inference entirely. Each target's inferred name can be overridden by setting the value here.
   *
   * e.g. To rename the `build` target to `build:dotnet`, set `inferredTargets.build` to `build:dotnet`.
   */
  inferredTargets?: ConfiguredTargets | false;

  /**
   * Ignores the specified paths when inferring projects
   */
  ignorePaths?: string[];

  /**
   * Tags to apply to inferred projects
   */
  tags?: string[];
};

export type NxDotnetConfig = NxDotnetConfigV1 | NxDotnetConfigV2;

export type ResolvedConfig = NxDotnetConfigV2 & {
  inferredTargets: false | Required<ConfiguredTargets>;
  ignorePaths: string[];
  tags: string[];
};
