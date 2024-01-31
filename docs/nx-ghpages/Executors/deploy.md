# @nx-dotnet/nx-ghpages:deploy

## Deploy

Deploy a page to a specified repository&#39;s gh-pages branch.

## Options

### <span className="required">remote</span>

- (string): URL for the git remote to deploy to.

### <span className="required">directory</span>

- (string): Directory to push to gh-pages

### remoteName

- (string): Name of the remote to push to

### commitMessage

- (string): Message of the git commit to gh-pages branch

### baseBranch

- (string): Base branch to sync the gh-pages branch with

### syncWithBaseBranch

- (string): Indicate if the gh-pages branch should be synced with the base branch

### syncStrategy

- (string): Git command to use to sync the gh-pages branch with the base branch
