import { GetBuildExecutorConfiguration } from './build-executor-configuration';

describe('build executor configuration', () => {
  it('should start with {workspaceRoot} for v15+', () => {
    expect(GetBuildExecutorConfiguration('test')?.outputs?.[0]).toEqual(
      '{workspaceRoot}/dist/test',
    );
  });

  // Mocking doesn't really work since NX_VERSION is a const
  xit('should not start with {workspaceRoot} for v14', () => {
    expect(GetBuildExecutorConfiguration('test')?.outputs?.[0]).toEqual(
      'dist/test',
    );
  });
});
