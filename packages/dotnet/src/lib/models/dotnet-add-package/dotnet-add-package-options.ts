import { dotnetAddPackageFlags } from './dotnet-add-package-flags';

export type dotnetAddPackageOptions = {
  [key in dotnetAddPackageFlags]?: string | boolean;
};
