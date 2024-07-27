import { logger, workspaceRoot } from '@nx/devkit';

import { exec as execCallback } from 'child_process';
import { stat } from 'fs';
import { join } from 'path';
import { promisify } from 'util';

import { BuildExecutorSchema } from './schema';
import { readNxJson } from 'nx/src/config/nx-json';

const exec = promisify(execCallback);

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
  logger.info('Pushing to GH Pages');
  try {
    await exec(`git checkout -b gh-pages`, { cwd: directory });
  } catch {
    logger.warn('Resetting gh-pages branch, as it already exists.');
    await exec(`git checkout -B gh-pages`, { cwd: directory });
  }
  if (options.syncWithBaseBranch) {
    const baseBranch =
      options.baseBranch || readNxJson()?.affected?.defaultBase || 'master';
    const syncStrategy = options.syncStrategy;
    await exec(`git ${syncStrategy} ${options.remoteName}/${baseBranch}`, {
      cwd: directory,
    });
  }

  await exec(`git push -f --set-upstream ${options.remoteName} gh-pages`, {
    cwd: directory,
  });
  logger.info('Pushing to GH Pages -- COMPLETE');

  return {
    success: true,
  };
}
