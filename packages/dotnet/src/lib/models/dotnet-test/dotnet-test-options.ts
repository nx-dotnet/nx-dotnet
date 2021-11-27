import { dotnetTestFlags } from './dotnet-test-flags';

export type dotnetTestOptions = { [key in dotnetTestFlags]?: string | boolean };
