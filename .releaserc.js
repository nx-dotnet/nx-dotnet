module.exports = {
  branches: ['master', { name: 'dev', prerelease: true }],
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      {
        preset: 'angular',
        releaseRules: [
          { type: 'docs', release: false },
          { type: 'test', release: false },
          { scope: 'ci', release: false },
          { scope: 'repo', release: false },
          { type: 'release', release: false },
        ],
      },
    ],
    [
      '@semantic-release/release-notes-generator',
      {
        presetConfig: {
          types: [
            { type: 'feat', hidden: false },
            { type: 'fix', hidden: false },
            { type: 'chore', hidden: true },
            { type: 'docs', hidden: true },
            { type: 'style', hidden: true },
            { type: 'refactor', hidden: true },
            { type: 'test', hidden: true },
            { type: 'release', hidden: true },
          ],
        },
      },
    ],
    '@semantic-release/changelog',
    [
      '@semantic-release/exec',
      {
        publishCmd: [
          'npx ts-node tools/scripts/publish-all ${nextRelease.version} ${nextRelease.channel}',
        ].join(' && '),
      },
    ],
    [
      '@semantic-release/git',
      {
        assets: ['CHANGELOG.md', `packages/**/package.json`, 'package.json'],
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
