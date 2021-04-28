export type dotnetNewFlags =
  | 'dryRun'
  | 'force'
  | 'language'
  | 'name'
  | 'install'
  | 'nugetSource'
  | 'output'
  | 'uninstall'
  | 'updateApply'
  | 'updateCheck';

export const newKeyMap: Partial<{ [key in dotnetNewFlags]: string }> = {
  dryRun: 'dry-run',
  updateApply: 'update-apply',
  updateCheck: 'update-check',
  nugetSource: 'nuget-source',
};
