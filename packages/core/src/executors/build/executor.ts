import { ExecutorContext } from '@nrwl/devkit';
import { BuildExecutorSchema } from './schema';
import { ExecuteDotNet } from '../utils/execute-dotnet';
export default async function runExecutor(options: BuildExecutorSchema, context: ExecutorContext) {
  const params = {
    '-c': options.configuration
  };
  if (options.versionSuffix) {
    params['--version-suffix'] = options.versionSuffix
  }
  if (options.framework) {
    params['-f'] = options.framework
  }
  return ExecuteDotNet('build', context, params);
}
