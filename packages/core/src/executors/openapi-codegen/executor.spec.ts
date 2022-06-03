import executor from './executor';

import * as childProcess from 'child_process';

describe('OpenapiCodegen Executor', () => {
  it('can run', async () => {
    const execSpy = jest
      .spyOn(childProcess, 'exec')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .mockImplementation((cmd, opts, cb: any) => {
        cb();
        return null as unknown as childProcess.ChildProcess;
      });
    const output = await executor({
      openapiJsonPath: 'mock-path',
      outputProject: 'mock-project',
    });

    expect(execSpy).toHaveBeenCalled();
    expect(output.success).toBe(true);
  });
});
