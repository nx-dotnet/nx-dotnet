const nxPreset = require('@nx/jest/preset').default;

module.exports = {
  ...nxPreset,
  testEnvironment: 'node',
  prettierPath: require.resolve('prettier-2'),
  forceExit: true,
};
