import { dotnetFormatFlags } from './dotnet-format-flags';

export type dotnetFormatOptions = {
  [key in dotnetFormatFlags]?: string | boolean;
};
