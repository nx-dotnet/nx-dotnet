const Configuration = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [1, 'always', ['repo', 'dotnet', 'core', 'typescript', 'ci']],
  },
};

module.exports = Configuration;
