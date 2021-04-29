import { dotnetAddPackageFlags } from './dotnet-add-package-flags';

export type dotnetAddPackageOptions = {
  flag: dotnetAddPackageFlags;
  value?: string | boolean;
}[];
