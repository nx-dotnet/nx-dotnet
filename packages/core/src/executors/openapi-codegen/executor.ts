import {
  ExecutorContext,
  getPackageManagerCommand,
  logger,
  workspaceRoot,
} from '@nx/devkit';

import { exec, spawn } from 'child_process';

import { OpenapiCodegenExecutorSchema } from './schema';

export default function runExecutor(
  options: OpenapiCodegenExecutorSchema,
  context: ExecutorContext,
): Promise<{ success: boolean }> {
  if (options.useOpenApiGenerator) {
    return runOpenAPIGenerator(options, context);
  }
  return runNxDotnetOpenAPIGenerator(options);
}

function runNxDotnetOpenAPIGenerator(
  options: OpenapiCodegenExecutorSchema,
): Promise<{ success: boolean }> {
  return new Promise((resolve, reject) => {
    exec(
      `${
        getPackageManagerCommand().exec
      } nx g @nx-dotnet/core:swagger-typescript --openapiJsonPath="${
        options.openapiJsonPath
      }" --outputProject="${options.outputProject}"`,
      { cwd: workspaceRoot, windowsHide: true },
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

function runOpenAPIGenerator(
  options: OpenapiCodegenExecutorSchema,
  context: ExecutorContext,
): Promise<{ success: boolean }> {
  return new Promise((resolve, reject) => {
    const outputProjectRoot =
      context.projectGraph?.nodes[options.outputProject]?.data.root;

    if (!outputProjectRoot) {
      reject({
        success: false,
        error: new Error(
          `Could not find project with name ${options.outputProject}`,
        ),
      });
      return;
    }

    const childProcess = spawn(
      'npx',
      [
        'openapi-generator-cli',
        'generate',
        `-g=${options.openApiGenerator}`,
        `-i=${options.openapiJsonPath}`,
        `-o=${outputProjectRoot}`,
        ...(options.openApiGeneratorArgs ?? []),
      ],
      { shell: true, stdio: 'inherit', windowsHide: true },
    );

    childProcess.on('error', (error) => {
      logger.error(error);
      reject({
        success: false,
        error,
      });
    });

    childProcess.on('exit', (code) => {
      if (code === 0) {
        resolve({
          success: true,
        });
      } else {
        reject({
          success: false,
          error: new Error('OpenAPI generator failed'),
        });
      }
    });
  });
}
