import executor from './executor';
import { OpenapiCodegenExecutorSchema } from './schema';

const options: OpenapiCodegenExecutorSchema = {};

describe('OpenapiCodegen Executor', () => {
  it('can run', async () => {
    const output = await executor(options);
    expect(output.success).toBe(true);
  });
});
