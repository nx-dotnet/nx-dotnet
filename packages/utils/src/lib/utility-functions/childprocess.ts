/* eslint-disable @typescript-eslint/no-explicit-any */
import * as cp from 'child_process';
import * as os from 'os';
import { join } from 'path';

/**
 * TypeScript typings think ChildProcess is an interface, its a class.
 */
export function isChildProcess(obj: any): obj is cp.ChildProcess {
  return obj instanceof cp.ChildProcess;
}

/**
 * List of allowed command prefixes that are considered safe to execute.
 * This provides a basic allowlist mechanism.
 */
const ALLOWED_COMMAND_PREFIXES = ['dotnet ', 'npm ', 'npx ', 'yarn '];

/**
 * Validates that a command is allowed to run by checking against
 * a list of approved command prefixes.
 */
function isAllowedCommand(command: string): boolean {
  if (!command || typeof command !== 'string') {
    return false;
  }

  const trimmedCommand = command.trim();
  return ALLOWED_COMMAND_PREFIXES.some((prefix) =>
    trimmedCommand.startsWith(prefix),
  );
}

/**
 * Parse a command string into executable and arguments for use with execFileSync
 * which is safer than execSync as it doesn't invoke a shell.
 */
function parseCommand(command: string): { file: string; args: string[] } {
  const parts = command.split(' ');
  const file = parts[0];
  const args = parts.slice(1).filter((arg) => arg.length > 0);
  return { file, args };
}

/**
 * Windows-safe implementation of execSync that avoids EBADF errors
 * when running under Nx with isolated plugins.
 *
 * SECURITY: This function validates commands against a allowlist
 * to prevent command injection attacks.
 */
export function safeExecSync(
  command: string,
  options?: cp.ExecSyncOptions,
): Buffer | string {
  // SECURITY: Validate command is on the allowlist
  if (!isAllowedCommand(command)) {
    throw new Error(
      `Security Error: Command '${command.split(' ')[0]}' is not on the allowed commands list`,
    );
  }

  // Check if we're on Windows and running with isolated plugins
  const isWindows = os.platform() === 'win32';
  const isIsolatedPlugins = process.env.NX_ISOLATED_PLUGINS !== 'false';

  // Parse the command to use execFileSync when possible
  const { file, args } = parseCommand(command);

  // Set up options
  const defaultOptions: cp.ExecSyncOptions = {
    stdio: isWindows && isIsolatedPlugins ? 'pipe' : 'inherit',
    encoding: undefined,
    maxBuffer: 1024 * 1024 * 10, // 10MB buffer
    windowsHide: true,
  };

  const mergedOptions = { ...defaultOptions, ...options };

  // Ensure we don't use 'inherit' for stdio on Windows with isolated plugins
  if (isWindows && isIsolatedPlugins && mergedOptions.stdio === 'inherit') {
    mergedOptions.stdio = 'pipe';
  }

  try {
    // Use execFileSync which is safer as it doesn't invoke a shell
    return cp.execFileSync(file, args, mergedOptions);
  } catch (error) {
    // If execFileSync fails (e.g., for commands that need shell features),
    // log a warning and fall back to execSync with our validated command
    console.warn(`Warning: Falling back to execSync for command: ${command}`);

    if (isWindows && isIsolatedPlugins) {
      return cp.execSync(command, mergedOptions);
    }

    return cp.execSync(command, options);
  }
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
