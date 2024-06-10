import { DotnetNewFlags } from './dotnet-new-flags';

export type DotnetNewOptions = {
  [key in DotnetNewFlags]?: string | boolean;
};
