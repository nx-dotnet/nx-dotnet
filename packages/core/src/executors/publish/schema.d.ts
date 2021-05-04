import { dotnetPublishFlags } from '@nx-dotnet/dotnet';

export type PublishExecutorSchema = {
  [key in dotnetPublishFlags]?: string;
};
