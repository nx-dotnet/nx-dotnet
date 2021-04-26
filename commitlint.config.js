const Configuration = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [1, 'always', ['repo', 'dotnet', 'core', 'typescript', 'ci']],
    'type-enum': [1, 'always', ['test', 'docs', 'chore', 'feat', 'fix']],
  },
};

module.exports = Configuration;
