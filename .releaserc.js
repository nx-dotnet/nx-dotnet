module.exports = {
  branches: ['master', { name: 'dev', prerelease: true }],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    '@semantic-release/changelog',
    [
      '@semantic-release/exec',
      {
        publish: [
          'yarn ts-node tools/scripts/publish-all ${nextRelease.version} ${nextRelease.channel}',
        ],
      },
    ],
    [
      '@semantic-release/git',
      {
        assets: ['CHANGELOG.md', `**/package.json`],
        message: 'release(): ${nextRelease.version}\n\n${nextRelease.notes}',
      },
    ],
    [
      '@semantic-release/github',
      {
        failComment: false,
        releasedLabels: false,
        addReleases: 'top',
      },
    ],
  ],
};
