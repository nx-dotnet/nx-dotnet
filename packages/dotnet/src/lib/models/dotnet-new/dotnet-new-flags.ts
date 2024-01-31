import { CommandLineParamFixes } from '@nx-dotnet/utils';

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

export const newCommandLineParamFixes: CommandLineParamFixes<dotnetNewFlags> = {
  keyMap: {
    dryRun: 'dry-run',
    updateApply: 'update-apply',
    updateCheck: 'update-check',
    nugetSource: 'nuget-source',
  },
  explicitFalseKeys: [],
};
