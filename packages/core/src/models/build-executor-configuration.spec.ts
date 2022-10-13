import { GetBuildExecutorConfiguration } from './build-executor-configuration';

const mockPackageJson = {
  version: '14.0.0',
};

jest.mock('nx/package.json', () => mockPackageJson);

describe('build executor configuration', () => {
  it('should start with {workspaceRoot} for v15+', () => {
    mockPackageJson.version = '15.0.0';
    expect(GetBuildExecutorConfiguration('test')?.outputs?.[0]).toEqual(
      '{workspaceRoot}/dist/test',
    );
  });

  it('should not start with {workspaceRoot} for v14', () => {
    mockPackageJson.version = '14.0.0';
    expect(GetBuildExecutorConfiguration('test')?.outputs?.[0]).toEqual(
      'dist/test',
    );
  });
});
