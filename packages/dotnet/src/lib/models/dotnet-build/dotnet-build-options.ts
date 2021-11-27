import { dotnetBuildFlags } from './dotnet-build-flags';

export type dotnetBuildOptions = {
  [key in dotnetBuildFlags]?: string | boolean;
};
