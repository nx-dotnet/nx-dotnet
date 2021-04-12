import { BuildExecutorSchema } from './schema';
import executor from './executor';
import { ExecutorContext } from '@nrwl/devkit';

const options: BuildExecutorSchema = {
  configuration: 'Debug',
};

describe('Build Executor', () => {
  let context: ExecutorContext;

  beforeEach(() => {
    context = {
      root: '/root',
      cwd: '/root',
      projectName: 'my-app',
      targetName: 'build',
      workspace: {
        version: 2,
        projects: {
          'my-app': {
            root: 'apps/my-app',
            targets: {}
          }
        },
      },
      isVerbose: false,
    };
  });

  it('detects no dotnet project', () => {
    const promise = executor(options, context);
    expect(promise).rejects.toBeCalled();
  });
});
