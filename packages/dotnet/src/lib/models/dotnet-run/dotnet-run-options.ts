import { dotnetRunFlags } from './dotnet-run-flags';

export type dotnetRunOptions = {
  flag: dotnetRunFlags;
  value?: string | boolean;
}[];
