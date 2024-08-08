import RemarkGithubPlugin from 'remark-github';

export function GithubChangelogMarkdownPlugin(opts) {
  const originalTransformer = RemarkGithubPlugin(opts);

  const wrappedTransformer: typeof originalTransformer = (tree, file) => {
    if (file.path.includes('CHANGELOG')) {
      tree.children.unshift({
        type: 'heading',
        depth: 1,
        children: [{ type: 'text', value: 'Changelog' }],
      });

      originalTransformer(tree, file);
    }
  };
  return wrappedTransformer;
}
