import { dotnetPublishFlags } from './dotnet-publish-flags';

export type dotnetPublishOptions = {
  flag: dotnetPublishFlags;
  value?: string | boolean;
}[];
