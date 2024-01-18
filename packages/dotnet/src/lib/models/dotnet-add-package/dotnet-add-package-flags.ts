import { CommandLineParamFixes } from '@nx-dotnet/utils';

export type dotnetAddPackageFlags =
  | 'version'
  | 'framework'
  | 'packageDirectory'
  | 'prerelease'
  | 'noRestore'
  | 'source';

export const addPackageCommandLineParamFixes: CommandLineParamFixes<dotnetAddPackageFlags> =
  {
    keyMap: {
      packageDirectory: 'package-directory',
      noRestore: 'no-restore',
    },
    explicitFalseKeys: [],
  };
