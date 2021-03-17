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
export function dotnetFactory(): {
  command: string,
  info: {
    global: boolean,
    version: string | number
  }
} {
  // return the command line for local or global dotnet
  // check if dotnet is installed
  try {
    const version = execSync('dotnet --version').toString('utf-8').trim();
    return {
      command: 'dotnet',
      info: {
        global: true,
        version
      }
    }
  } catch (e) {
    throw new Error('dotnet not installed. Local support not yet added https://github.com/AgentEnder/nx-dotnet/issues/3');
  }
}
