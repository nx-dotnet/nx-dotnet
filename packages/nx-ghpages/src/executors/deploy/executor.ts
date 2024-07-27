import { logger, workspaceRoot } from '@nx/devkit';

import { ExecOptions, exec as execCallback } from 'child_process';
import { stat, writeFileSync } from 'fs';
import { join } from 'path';

import { BuildExecutorSchema } from './schema';
import { readNxJson } from 'nx/src/config/nx-json';

function exec(command: string, options: ExecOptions) {
  return new Promise((resolve, reject) => {
    const childProcess = execCallback(
      command,
      options,
      (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve(stdout);
        }
      },
    );

    childProcess.stdout?.pipe(process.stdout);
    childProcess.stderr?.pipe(process.stderr);
  });
}

async function exists(path: string) {
  return new Promise((resolve) => {
    stat(path, (err) => resolve(err === null));
  });
}

export default async function deployExecutor(options: BuildExecutorSchema) {
  const directory = join(workspaceRoot, options.directory);

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

  const envToken = process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN;
  if (envToken) {
    options.remote = options.remote.replace(
      'https://',
      `https://github-actions:${envToken}@`,
    );
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
