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
 *
 * Security note: This function should only be used with trusted command inputs.
 * Do not pass unsanitized user input directly to this function.
 */
export function safeExecSync(
  command: string,
  options?: cp.ExecSyncOptions,
): Buffer | string {
  // Validate command to ensure it's not empty or just whitespace
  if (!command || typeof command !== 'string' || !command.trim()) {
    throw new Error('Invalid command: Command cannot be empty');
  }

  // Check if we're on Windows and running with isolated plugins
  const isWindows = os.platform() === 'win32';
  const isIsolatedPlugins = process.env.NX_ISOLATED_PLUGINS !== 'false';

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

    // SECURITY: Validate and use execSync only with trusted commands
    // Do not use this function with unsanitized user input
    return cp.execSync(command, mergedOptions);
  }

  // Default behavior for non-Windows or when not using isolated plugins
  return cp.execSync(command, options);
}

/**
 * A safer alternative to safeExecSync when you need to execute a specific command
 * with arguments. This uses execFileSync which doesn't spawn a shell, reducing
 * the risk of command injection.
 *
 * @param file The executable to run
 * @param args The arguments to pass to the executable
 * @param options Options for the child process
 * @returns The command output
 */
export function safeExecFileSync(
  file: string,
  args: string[] = [],
  options?: cp.ExecFileSyncOptions,
): Buffer | string {
  if (!file || typeof file !== 'string' || !file.trim()) {
    throw new Error('Invalid executable: File path cannot be empty');
  }

  return cp.execFileSync(file, args, options);
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
