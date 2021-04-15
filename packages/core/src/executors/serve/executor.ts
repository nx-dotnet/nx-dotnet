import { ExecutorContext } from '@nrwl/devkit';
import { ServeExecutorSchema } from './schema';

export default async function runExecutor(
  options: ServeExecutorSchema,
  context: ExecutorContext
) {
  console.log('Executor ran for Serve', options)
  return {
    success: true
  }
}

