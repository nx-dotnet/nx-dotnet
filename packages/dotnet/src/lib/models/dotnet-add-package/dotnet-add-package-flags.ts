export type dotnetAddPackageFlags =
  | 'version'
  | 'framework'
  | 'packageDirectory'
  | 'prerelease'
  | 'noRestore'
  | 'source';

export const addPackageKeyMap: Partial<
  { [key in dotnetAddPackageFlags]: string }
> = {
  packageDirectory: 'package-directory',
  noRestore: 'no-restore',
};
