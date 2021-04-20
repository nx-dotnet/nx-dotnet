import { dotnetTestFlags } from './dotnet-test-flags';

export type dotnetTestOptions = {
  flag: dotnetTestFlags;
  value?: string | boolean;
}[];
