export type dotnetFormatFlags =
  | 'noRestore'
  // Deliberately excluding the folder option, as the csproj file is always used as the workspace.
  | 'fixWhitespace'
  | 'fixStyle'
  | 'fixAnalyzers'
  | 'diagnostics'
  | 'include'
  | 'exclude'
  | 'check'
  | 'report'
  | 'binarylog'
  | 'verbosity'
  | 'verifyNoChanges';
// Deliberately excluding the version option, as it doesn't perform any actual formatting.

export const formatKeyMap: Partial<{ [key in dotnetFormatFlags]: string }> = {
  noRestore: 'no-restore',
  fixWhitespace: 'fix-whitespace',
  fixStyle: 'fix-style',
  fixAnalyzers: 'fix-analyzers',
  verifyNoChanges: 'verify-no-changes',
};
