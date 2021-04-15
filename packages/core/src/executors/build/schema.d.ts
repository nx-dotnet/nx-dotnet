import { dotnetBuildFlags } from '@nx-dotnet/dotnet';

export type BuildExecutorSchema = {
  [key in dotnetBuildFlags]?: string
}
