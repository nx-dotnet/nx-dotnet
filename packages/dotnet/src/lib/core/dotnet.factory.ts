import { execSync } from 'child_process';
import { safeExecSync } from '@nx-dotnet/utils';

/**
 * get CLI command line runner
 *
 * @export
 * @returns {({
 *   command: string,
 *   info: {
 *     global: boolean,
 *     version: string | number
 *   }
 * })}
 */
export function dotnetFactory(): LoadedCLI {
  // return the command line for local or global dotnet
  // check if dotnet is installed
  try {
    // Use safeExecSync to prevent EBADF errors on Windows when running with NX_ISOLATED_PLUGINS=true
    const version = safeExecSync('dotnet --version', { windowsHide: true })
      .toString('utf-8')
      .trim();
    return {
      command: 'dotnet',
      info: {
        global: true,
        version,
      },
    };
  } catch (e) {
    throw new Error(
      'dotnet not installed. Local support not yet added https://github.com/AgentEnder/nx-dotnet/issues/3',
    );
  }
}

export function mockDotnetFactory(version?: string): LoadedCLI {
  return {
    command: 'echo',
    info: { global: true, version: version ?? '6.0.100' },
  };
}

export type LoadedCLI = {
  command: string;
  info: { global: boolean; version: string | number };
};

export type DotnetFactory = () => LoadedCLI;
