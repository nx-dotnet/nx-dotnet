import { tmpProjPath } from '@nrwl/nx-plugin/testing';
import { ChildProcess, exec, execSync } from 'child_process';
import {
  copySync,
  createFileSync,
  ensureDirSync,
  moveSync,
  readdirSync,
  readFileSync,
  removeSync,
  renameSync,
  statSync,
  writeFileSync,
} from 'fs-extra';
import * as path from 'path';
import { dirSync } from 'tmp';

import * as isCI from 'is-ci';
import { workspaceConfigName } from 'nx/src/config/workspaces';
import { detectPackageManager } from '@nrwl/devkit';
interface RunCmdOpts {
  silenceError?: boolean;
  env?: Record<string, string> | NodeJS.ProcessEnv;
  cwd?: string;
  silent?: boolean;
}

export function uniq(prefix: string) {
  return `${prefix}${Math.floor(Math.random() * 10000000)}`;
}

export function getSelectedPackageManager(): 'npm' | 'yarn' | 'pnpm' {
  return process.env.SELECTED_PM as 'npm' | 'yarn' | 'pnpm';
}

// Useful in order to cleanup space during CI to prevent `No space left on device` exceptions
export function removeProject({ onlyOnCI = false } = {}) {
  if (onlyOnCI && !isCI) {
    return;
  }
  removeSync(tmpProjPath());
}

export function supportUi() {
  return false;
  // return !process.env.NO_CHROME;
}

export function runCommandAsync(
  command: string,
  opts: RunCmdOpts = {
    silenceError: false,
    env: process.env,
  },
): Promise<{ stdout: string; stderr: string; combinedOutput: string }> {
  return new Promise((resolve, reject) => {
    exec(
      command,
      {
        cwd: tmpProjPath(),
        env: { ...process.env, FORCE_COLOR: 'false' },
      },
      (err, stdout, stderr) => {
        if (!opts.silenceError && err) {
          reject(err);
        }
        resolve({ stdout, stderr, combinedOutput: `${stdout}${stderr}` });
      },
    );
  });
}

export function runCommandUntil(
  command: string,
  criteria: (output: string) => boolean,
  { kill = true } = {},
): Promise<{ process: ChildProcess }> {
  const pm = getPackageManagerCommand();
  const p = exec(`${pm.runNx} ${command}`, {
    cwd: tmpProjPath(),
    env: { ...process.env, FORCE_COLOR: 'false' },
  });

  return new Promise((res, rej) => {
    let output = '';
    let complete = false;

    function checkCriteria(c: any) {
      output += c.toString();
      if (criteria(output)) {
        complete = true;
        res({ process: p });
        if (kill) {
          p.kill();
        }
      }
    }

    p.stdout?.on('data', checkCriteria);
    p.stderr?.on('data', checkCriteria);
    p.on('exit', (code) => {
      if (code !== 0 && !complete) {
        console.log(output);
      }
      rej(`Exited with ${code}`);
    });
  });
}

export function runCLIAsync(
  command: string,
  opts: RunCmdOpts = {
    silenceError: false,
    env: process.env,
    silent: false,
  },
): Promise<{ stdout: string; stderr: string; combinedOutput: string }> {
  const pm = getPackageManagerCommand();
  return runCommandAsync(
    `${opts.silent ? pm.runNxSilent : pm.runNx} ${command}`,
    opts,
  );
}

export function runCLI(
  command?: string,
  opts: RunCmdOpts = {
    silenceError: false,
    env: process.env,
  },
): string {
  try {
    const pm = getPackageManagerCommand();
    let r = execSync(`${pm.runNx} ${command}`, {
      cwd: opts.cwd || tmpProjPath(),
      env: opts.env,
    }).toString();
    r = r.replace(
      /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
      '',
    );
    if (process.env.VERBOSE_OUTPUT) {
      console.log(r);
    }

    return r;
  } catch (e: any) {
    if (opts.silenceError) {
      return e.stdout.toString();
    } else {
      console.log('original command', command);
      console.log(e.stdout?.toString(), e.stderr?.toString());
      throw e;
    }
  }
}

export function expectTestsPass(v: { stdout: string; stderr: string }) {
  expect(v.stderr).toContain('Ran all test suites');
  expect(v.stderr).not.toContain('fail');
}

export function runCommand(command: string): string {
  try {
    const r = execSync(command, {
      cwd: tmpProjPath(),
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, FORCE_COLOR: 'false' },
    }).toString();
    if (process.env.VERBOSE_OUTPUT) {
      console.log(r);
    }
    return r;
  } catch (e: any) {
    return e.stdout.toString() + e.stderr.toString();
  }
}

export function createFile(f: string, content: string = ''): void {
  const path = tmpProjPath(f);
  createFileSync(path);
  if (content) {
    updateFile(path, content);
  }
}

export function updateFile(
  f: string,
  content: string | ((content: string) => string),
): void {
  ensureDirSync(path.dirname(tmpProjPath(f)));
  if (typeof content === 'string') {
    writeFileSync(tmpProjPath(f), content);
  } else {
    writeFileSync(
      tmpProjPath(f),
      content(readFileSync(tmpProjPath(f)).toString()),
    );
  }
}

export function renameFile(f: string, newPath: string): void {
  ensureDirSync(path.dirname(tmpProjPath(newPath)));
  renameSync(tmpProjPath(f), tmpProjPath(newPath));
}

export function checkFilesExist(...expectedFiles: string[]) {
  expectedFiles.forEach((f) => {
    const ff = f.startsWith('/') ? f : tmpProjPath(f);
    if (!exists(ff)) {
      throw new Error(`File '${ff}' does not exist`);
    }
  });
}

export function checkFilesDoNotExist(...expectedFiles: string[]) {
  expectedFiles.forEach((f) => {
    const ff = f.startsWith('/') ? f : tmpProjPath(f);
    if (exists(ff)) {
      throw new Error(`File '${ff}' does not exist`);
    }
  });
}

export function listFiles(dirName: string) {
  return readdirSync(tmpProjPath(dirName));
}

export function readJson(f: string): any {
  return JSON.parse(readFile(f));
}

export function readFile(f: string) {
  const ff = f.startsWith('/') ? f : tmpProjPath(f);
  return readFileSync(ff).toString();
}

export function rmDist() {
  removeSync(`${tmpProjPath()}/dist`);
}

export function directoryExists(filePath: string): boolean {
  try {
    return statSync(filePath).isDirectory();
  } catch (err) {
    return false;
  }
}

export function fileExists(filePath: string): boolean {
  try {
    return statSync(filePath).isFile();
  } catch (err) {
    return false;
  }
}

export function exists(filePath: string): boolean {
  return directoryExists(filePath) || fileExists(filePath);
}

export function getSize(filePath: string): number {
  return statSync(filePath).size;
}

export function getPackageManagerCommand({
  p = tmpProjPath() as string,
  packageManager = detectPackageManager(p),
  scriptsPrependNodePath = true,
} = {}): {
  createWorkspace: string;
  runNx: string;
  runNxSilent: string;
  addDev: string;
  list: string;
} {
  const scriptsPrependNodePathFlag = scriptsPrependNodePath
    ? ' --scripts-prepend-node-path '
    : '';

  return {
    npm: {
      createWorkspace: `npx create-nx-workspace@${process.env.PUBLISHED_VERSION}`,
      runNx: `npm run nx${scriptsPrependNodePathFlag} --`,
      runNxSilent: `npm run nx --silent${scriptsPrependNodePathFlag} --`,
      addDev: `npm install --legacy-peer-deps -D`,
      list: 'npm ls --depth 10',
    },
    yarn: {
      // `yarn create nx-workspace` is failing due to wrong global path
      createWorkspace: `yarn global add create-nx-workspace@${process.env.PUBLISHED_VERSION} && create-nx-workspace`,
      runNx: `yarn nx`,
      runNxSilent: `yarn --silent nx`,
      addDev: `yarn add -D`,
      list: 'npm ls --depth 10',
    },
    pnpm: {
      createWorkspace: `pnpx create-nx-workspace@${process.env.PUBLISHED_VERSION}`,
      runNx: `pnpm run nx --`,
      runNxSilent: `pnpm run nx --silent --`,
      addDev: `pnpm add -D`,
      list: 'npm ls --depth 10',
    },
  }[packageManager];
}

export function expectNoAngularDevkit() {
  const { list } = getPackageManagerCommand();
  const result = runCommand(`${list} @angular-devkit/core`);
  expect(result).not.toContain('@angular-devkit/core');
}
