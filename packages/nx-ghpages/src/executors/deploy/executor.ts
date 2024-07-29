import { ExecutorContext, logger } from '@nx/devkit';

import { ExecOptions, exec as execCallback } from 'child_process';
import { stat, writeFileSync } from 'fs';
import { join } from 'path';

import { BuildExecutorSchema } from './schema';
import { readNxJson } from 'nx/src/config/nx-json';

function exec(command: string, options: ExecOptions) {
  return new Promise<string>((resolve, reject) => {
    const childProcess = execCallback(command, options, (error, stdout) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout);
      }
    });

    childProcess.stdout?.pipe(process.stdout);
    childProcess.stderr?.pipe(process.stderr);
  });
}

async function normalizeOptions(
  options: BuildExecutorSchema,
  context: ExecutorContext,
): Promise<
  BuildExecutorSchema & {
    remote: string;
    directory: string;
  }
> {
  const remote = options.remote ?? (await findDefaultRemote(context.root));
  if (!remote) {
    throw new Error(
      'No remote found. Please specify a remote url in the executor options.',
    );
  }

  return {
    ...options,
    remote: normalizeRemote(remote),
    directory: options.directory ?? findDefaultBuildDirectory(context),
  };
}

export function findDefaultBuildDirectory(context: ExecutorContext) {
  const targetProject = context.projectName;
  if (!targetProject) {
    throw new Error(
      'No target project found. Specify `directory` option manually.',
    );
  }
  const projectConfiguration =
    context.projectGraph?.nodes?.[targetProject]?.data;
  if (!projectConfiguration) {
    throw new Error(
      'Project configuration not found. Specify `directory` option manually.',
    );
  }

  const buildConfigurations = projectConfiguration.targets?.build;
  if (!buildConfigurations) {
    throw new Error(
      'No build configuration found. Specify `directory` option manually.',
    );
  }

  const possibleOutputPaths: string[] = [];
  if (context.configurationName) {
    const configuration =
      buildConfigurations.configurations?.[context.configurationName];
    if (configuration?.outputPath) {
      possibleOutputPaths.push(configuration.outputPath);
    }
  }

  if (buildConfigurations.defaultConfiguration) {
    const configuration =
      buildConfigurations.configurations?.[
        buildConfigurations.defaultConfiguration
      ];
    if (configuration?.outputPath) {
      possibleOutputPaths.push(configuration.outputPath);
    }
  }

  if (buildConfigurations.options?.outputPath) {
    possibleOutputPaths.push(buildConfigurations.options.outputPath);
  }

  const filtered = possibleOutputPaths.filter(Boolean);
  if (filtered.length > 0) {
    return filtered[0];
  }

  const outputs = buildConfigurations.outputs;
  if (outputs?.length === 1) {
    return outputs[0]
      .replace('{workspaceRoot}', '')
      .replace('{projectRoot}', projectConfiguration.root);
  } else if (outputs && outputs.length > 1) {
    throw new Error(
      'Multiple outputs found. Specify `directory` option manually.',
    );
  }

  throw new Error(
    'Unable to determine output directory. Specify `directory` option manually.',
  );
}

async function exists(path: string) {
  return new Promise((resolve) => {
    stat(path, (err) => resolve(err === null));
  });
}

async function findDefaultRemote(
  directory: string,
): Promise<string | undefined> {
  const lines = (await exec('git remote -v', { cwd: directory })).split('\n');
  const pushRemotes: string[] = [];
  for (const line of lines) {
    const [remoteName, url, type] = line.split(/\s+/).map((s) => s.trim());
    if (type === '(push)') {
      if (remoteName === 'origin') {
        return url;
      } else {
        pushRemotes.push(`${remoteName} (${url})`);
      }
    }
    logger.warn(
      'No remote named `origin` found. Please specify a remote url in the executor options manually.',
    );
    logger.warn('Available remotes:');
    for (const remote of pushRemotes) {
      logger.warn('- ' + remote);
    }
  }
}

function normalizeRemote(remote: string): string {
  const envToken = process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN;
  if (envToken) {
    if (remote.startsWith('git@')) {
      logger.warn(
        'Using SSH remotes to deploy to github pages is not currently supported. Transforming to HTTPS',
      );
      remote = remote.replace('git@', `https://`);
      logger.info('Transformed remote to HTTPS: ' + remote);
    }
    if (remote.startsWith('https://')) {
      if (!/:.*@/.test(remote)) {
        return remote.replace(
          'https://',
          `https://github-actions:${envToken}@`,
        );
      }
    }
  }
  return remote;
}

export default async function deployExecutor(
  raw: BuildExecutorSchema,
  context: ExecutorContext,
) {
  const options = await normalizeOptions(raw, context);

  const directory = join(context.root, options.directory);

  if (!(await exists(directory))) {
    logger.error(`Output directory does not exist! ${directory}`);
    return {
      success: false,
    };
  }

  if (options.CNAME) {
    logger.info(`Creating CNAME file for ${options.CNAME} in ${directory}`);
    writeFileSync(join(directory, 'CNAME'), options.CNAME);
  }

  logger.info('Setting up git remote');

  if (!(await exists(join(directory, '.git')))) {
    logger.info(
      `Git repository not found, initializing a blank repository ${directory}`,
    );
    await exec('git init', { cwd: directory });
  }

  try {
    await exec(`git remote add ${options.remoteName} ${options.remote}`, {
      cwd: directory,
    });
  } catch {
    await exec(`git remote set-url ${options.remoteName} ${options.remote}`, {
      cwd: directory,
    });
  }

  logger.info('Setting up git remote -- COMPLETE');
  logger.info('Authoring Commit');

  await exec(`git add .`, { cwd: directory });
  await exec(` git commit -m "${options.commitMessage}"`, {
    cwd: directory,
  });

  logger.info('Authoring Commit -- COMPLETE');
  try {
    await exec(`git checkout -b gh-pages`, { cwd: directory });
  } catch {
    logger.warn('Resetting gh-pages branch, as it already exists.');
    await exec(`git checkout -B gh-pages`, { cwd: directory });
  }
  if (options.syncWithBaseBranch) {
    const baseBranch =
      options.baseBranch || readNxJson()?.affected?.defaultBase || 'main';
    const syncStrategy = options.syncStrategy;
    const command = `git ${syncStrategy} ${
      options.remoteName
    }/${baseBranch} ${options.syncGitOptions.join(' ')}`;
    logger.info('Syncing with base branch: ' + command);
    await exec(command, {
      cwd: directory,
    });
  }
  logger.info('Pushing to GH Pages');
  try {
    await exec(`git push -f --set-upstream ${options.remoteName} gh-pages`, {
      cwd: directory,
    });
    logger.info('Pushing to GH Pages -- COMPLETE');
  } catch (error: unknown) {
    logger.info(
      '[hint]: You may need to set GH_TOKEN or GITHUB_TOKEN to have write access to the repository',
    );
    logger.error('Pushing to GH Pages -- FAILED');
    return {
      success: false,
    };
  }

  return {
    success: true,
  };
}
