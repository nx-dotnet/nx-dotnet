# @nx-dotnet/nx-ghpages:deploy

## Deploy

Deploy a page to a specified repository&#39;s gh-pages branch.

## Options

### remote

- (string): URL for the git remote to deploy to. If not specified, the remote will be determined based off of **this** repository&#39;s origin remote.

### directory

- (string): Directory to push to gh-pages. If not specified, the output directory will be determined based off of this project&#39;s build target&#39;s output path.

### remoteName

- (string): Name of the remote to push to

### commitMessage

- (string): Message of the git commit to gh-pages branch

### baseBranch

- (string): Base branch to sync the gh-pages branch with

### syncWithBaseBranch

- (boolean): Indicate if the gh-pages branch should be synced with the base branch

### syncStrategy

- (string): Git command to use to sync the gh-pages branch with the base branch

### syncGitOptions

- (array): Additional git options to use when syncing the gh-pages branch with the base branch

### CNAME

- (string): Custom domain to use for the gh-pages branch. Applied by creating a CNAME file in the root of the gh-pages branch
