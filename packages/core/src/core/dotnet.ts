import { dotnetFactory } from './dotnet.factory';
import { execSync } from 'child_process';

export type BuildCommandTypes = 'build' | 'build-server' | 'msbuild' | 'run' | 'pack' | 'publish';
export type TestCommandTypes = 'vstest' | 'test';
// need better naming
export type CoreCommandTypes = 'new' | 'tool' | 'sln' | 'store' | 'remove' | 'clean';
export type PackagesCommandType = 'add' | 'nuget';

export type AllCommands = CoreCommandTypes | BuildCommandTypes | TestCommandTypes | PackagesCommandType;

export function dotnetCLI(command: AllCommands, commandInput: { dryRun?: boolean }): Buffer;
export function dotnetCLI<T extends Record<string, string>>(command: AllCommands, commandInput: T): Buffer {
  const cliCommand = dotnetFactory();
  const inputString = Object.entries(commandInput).reduce((prev, [key, value]) => {
    return `${prev} --${key} ${value}`
  }, '')
  return execSync(`${cliCommand} ${command} ${inputString}`);
}
