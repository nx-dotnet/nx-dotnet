import { dotnetNewFlags } from './dotnet-new-flags';

export type dotnetNewOptions = {
  flag: dotnetNewFlags;
  value?: string | boolean;
}[];
