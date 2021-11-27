import { dotnetRunFlags } from './dotnet-run-flags';

export type dotnetRunOptions = { [key in dotnetRunFlags]?: string | boolean };
