import { dotnetBuildFlags } from '../../models';

export type BuildExecutorSchema = {
  [key in dotnetBuildFlags]?: string
}
