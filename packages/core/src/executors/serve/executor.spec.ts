import { ServeExecutorSchema } from './schema';
import executor from './executor';
import { ExecutorContext } from '@nrwl/devkit';

const options: ServeExecutorSchema = {};

const root = process.cwd() + '/tmp';

describe('Serve Executor', () => {
  let context: ExecutorContext;

  beforeEach(() => {
    context = {
      root: root,
      cwd: root,
      projectName: 'my-app',
      targetName: 'build',
      workspace: {
        version: 2,
        projects: {
          'my-app': {
            root: `${root}/apps/my-app`,
            targets: {},
          },
        },
      },
      isVerbose: false,
    };
  })

  it('can run', async () => {
    const output = await executor(options, context);
    expect(output.success).toBe(true);
  });
});