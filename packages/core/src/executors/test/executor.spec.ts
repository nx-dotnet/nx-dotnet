import executor from './executor';
import { TestExecutorSchema } from './schema';

const options: TestExecutorSchema = {};

describe('Test Executor', () => {
  it('can run', async () => {
    const output = await executor(options);
    expect(output.success).toBe(true);
  });
});
