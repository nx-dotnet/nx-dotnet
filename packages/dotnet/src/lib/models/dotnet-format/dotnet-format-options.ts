import { dotnetFormatFlags } from './dotnet-format-flags';

export type dotnetFormatOptions = {
  flag: dotnetFormatFlags;
  value?: string | boolean;
}[];
