import { dotnetBuildFlags } from './dotnet-build-flags';

export type dotnetBuildOptions = {
  flag: dotnetBuildFlags;
  value?: string | boolean;
}[];
