import * as fs from 'fs';

import executor from './executor';
import { BuildExecutorSchema } from './schema';

jest.mock('child_process', () => ({
  exec: (
    cmd: string,
    opts: unknown,
    callback: (err: unknown, stdout: string, stdin: string) => void,
  ) => callback(null, '', ''),
}));

jest.mock('fs', () => ({
  ...(jest.requireActual('fs') as typeof fs),
  stat: (path: string, cb: (err: unknown, stats: unknown) => void) =>
    cb(null, {}),
}));

const options: BuildExecutorSchema = {
  directory: '',
  remote: '',
  remoteName: '',
};

describe('Build Executor', () => {
  it('can run', async () => {
    const output = await executor(options);
    expect(output?.success).toBe(true);
  });
});
