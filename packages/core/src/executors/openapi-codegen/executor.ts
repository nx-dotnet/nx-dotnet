import { getPackageManagerCommand, logger, workspaceRoot } from '@nrwl/devkit';
import { exec } from 'child_process';
import { OpenapiCodegenExecutorSchema } from './schema';

export default function runExecutor(
  options: OpenapiCodegenExecutorSchema,
): Promise<{ success: boolean }> {
  return new Promise((resolve, reject) => {
    exec(
      `${
        getPackageManagerCommand().exec
      } nx g @nx-dotnet/core:swagger-typescript --openapiJsonPath="${
        options.openapiJsonPath
      }" --outputProject="${options.outputProject}"`,
      { cwd: workspaceRoot },
      (error, stdout) => {
        if (error) {
          logger.error(error);
          reject({
            success: false,
            error,
          });
        } else {
          logger.info(stdout);
          resolve({
            success: true,
          });
        }
      },
    );
  });
}
