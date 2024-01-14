export interface BuildExecutorSchema {
  remote: string;
  directory: string;
  remoteName: string;
  commitMessage: string;
  baseBranch: string;
  syncWithBaseBranch: boolean;
  syncStrategy: 'rebase' | 'merge';
}
