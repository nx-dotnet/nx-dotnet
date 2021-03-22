import { BuildExecutorSchema } from './schema';
import executor from './executor';
import { ExecutorContext } from '@nrwl/devkit';

const options: BuildExecutorSchema = {
  configuration: 'Debug',
  versionSuffix: 1,
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
        projects: {},
      },
      isVerbose: false,
    };
  });

  it('can run', async () => {
    const output = await executor(options, context);
    // expect(output.success).toBe(true);
  });
});
