import { TestExecutorSchema } from './schema';

export default async function runExecutor(
  options: TestExecutorSchema,
) {
  console.log('Executor ran for Test', options)
  return {
    success: true
  }
}

