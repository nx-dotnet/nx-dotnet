/* eslint-disable */
export default {
  displayName: 'core',
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.[tj]sx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/packages/core',
  testEnvironment: 'node',
  // Set timeout for individual tests (in milliseconds)
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
};
