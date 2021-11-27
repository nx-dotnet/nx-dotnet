import { dotnetNewFlags } from './dotnet-new-flags';

export type dotnetNewOptions = {
  [key in dotnetNewFlags]?: string | boolean;
};
