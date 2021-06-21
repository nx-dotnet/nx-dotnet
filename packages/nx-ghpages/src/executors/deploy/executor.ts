import { BuildExecutorSchema } from './schema';
import { exec as execCallback } from 'child_process';
import { stat } from 'fs';
import { dirname, join } from 'path';
import { promisify } from 'util';
import { logger } from '@nrwl/devkit';

const exec = promisify(execCallback);

async function exists(path: string) {
  return new Promise((resolve) => {
    stat(path, (err) => resolve(err ? false : true));
  });
}

export default async function deployExecutor(options: BuildExecutorSchema) {
  const directory = join(await findWorkspaceRoot(), options.directory);

  if (!(await exists(directory))) {
    logger.error(`Output directory does not exist! ${directory}`);
    return {
      success: false,
    };
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
  await exec(` git commit -m "deploy to gh-pages (nx-ghpages)"`, {
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
  await exec(`git push -f --set-upstream ${options.remoteName} gh-pages`, {
    cwd: directory,
  });
  logger.info('Pushing to GH Pages -- COMPLETE');

  console.log('After exec statements');

  return {
    success: true,
  };
}

async function findWorkspaceRoot(dir: string = process.cwd()): Promise<string> {
  if (dirname(dir) === dir) {
    throw new Error(`The cwd isn't part of an Nx workspace`);
  }
  if (
    (await exists(join(dir, 'angular.json'))) ||
    (await exists(join(dir, 'workspace.json')))
  ) {
    return dir;
  }
  return findWorkspaceRoot(dirname(dir));
}
