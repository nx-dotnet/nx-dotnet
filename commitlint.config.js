const Configuration = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [1, 'always', ['repo', 'dotnet', 'core', 'typescript']],
  },
};

module.exports = Configuration;
