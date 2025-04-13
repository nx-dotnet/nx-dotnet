/* eslint-disable @typescript-eslint/no-explicit-any */
import * as cp from 'child_process';
import * as os from 'os';

/**
 * TypeScript typings think ChildProcess is an interface, its a class.
 */
export function isChildProcess(obj: any): obj is cp.ChildProcess {
  return obj instanceof cp.ChildProcess;
}

/**
 * Windows-safe implementation of execSync that avoids EBADF errors
 * when running under Nx with isolated plugins.
 */
export function safeExecSync(
  command: string,
  options?: cp.ExecSyncOptions,
): Buffer | string {
  // Check if we're on Windows and running with isolated plugins
  const isWindows = os.platform() === 'win32';
  const isIsolatedPlugins = process.env.NX_ISOLATED_PLUGINS === 'true';

  // Only apply special handling for Windows with isolated plugins
  if (isWindows && isIsolatedPlugins) {
    const defaultOptions: cp.ExecSyncOptions = {
      stdio: 'pipe', // Use 'pipe' instead of 'inherit' to avoid file descriptor issues
      encoding: undefined, // Use undefined to ensure Buffer return type if not specified by user
      maxBuffer: 1024 * 1024 * 10, // 10MB buffer
      windowsHide: true,
    };

    const mergedOptions = { ...defaultOptions, ...options };

    // Ensure we don't use 'inherit' for stdio on Windows with isolated plugins
    if (mergedOptions.stdio === 'inherit') {
      mergedOptions.stdio = 'pipe';
    }

    return cp.execSync(command, mergedOptions);
  }

  // Default behavior for non-Windows or when not using isolated plugins
  return cp.execSync(command, options);
}

export async function handleChildProcessPassthrough(
  childProcess: cp.ChildProcess,
) {
  let resolver: () => void;

  const exitHandler = async () => {
    if (childProcess) {
      childProcess.kill('SIGINT');
      childProcess.kill('SIGINT');
    }
    process.removeListener('exit', exitHandler);
    process.removeListener('SIGINT', exitHandler);
    process.removeListener('SIGUSR1', exitHandler);
    process.removeListener('SIGUSR2', exitHandler);
    process.removeListener('uncaughtException', exitHandler);
    resolver();
  };

  //do something when app is closing
  process.on('exit', exitHandler);

  //catches ctrl+c event
  process.on('SIGINT', exitHandler);

  // catches "kill pid" (for example: nodemon restart)
  process.on('SIGUSR1', exitHandler);
  process.on('SIGUSR2', exitHandler);

  //catches uncaught exceptions
  process.on('uncaughtException', exitHandler);

  return new Promise<void>((resolve) => {
    resolver = resolve;
  });
}
