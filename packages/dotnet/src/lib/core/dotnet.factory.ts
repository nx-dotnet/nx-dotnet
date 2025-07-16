import { execSync } from 'child_process';

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
    const version = execSync('dotnet --version', { windowsHide: true })
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
    console.error(
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
