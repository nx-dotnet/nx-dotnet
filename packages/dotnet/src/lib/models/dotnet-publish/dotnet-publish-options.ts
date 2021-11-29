import { dotnetPublishFlags } from './dotnet-publish-flags';

export type dotnetPublishOptions = {
  [key in dotnetPublishFlags]?: string | boolean;
};
