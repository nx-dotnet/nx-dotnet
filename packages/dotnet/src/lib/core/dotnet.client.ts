import { ChildProcess, execSync, spawn } from 'child_process';

import {
  getParameterString,
  swapArrayFieldValueUsingMap,
} from '@nx-dotnet/utils';

import {
  dotnetBuildOptions,
  dotnetNewOptions,
  dotnetRunOptions,
  dotnetTemplate,
  dotnetTestOptions,
  testKeyMap,
} from '../models';
import { LoadedCLI } from './dotnet.factory';

export class DotNetClient {
  constructor(private cliCommand: LoadedCLI) {}

  new(template: dotnetTemplate, parameters?: dotnetNewOptions): Buffer {
    const paramString = parameters ? getParameterString(parameters) : '';
    const cmd = `${this.cliCommand.command} new ${template} ${paramString}`;
    return this.logAndExecute(cmd);
  }

  build(project: string, parameters?: dotnetBuildOptions): Buffer {
    const paramString = parameters ? getParameterString(parameters) : '';
    const cmd = `${this.cliCommand.command} build ${project} ${paramString}`;
    return this.logAndExecute(cmd);
  }

  run(project: string, parameters?: dotnetRunOptions): ChildProcess {
    const paramString = parameters ? getParameterString(parameters) : '';
    const cmd = `run --project ${project} ${paramString}`;
    console.log(`Executing Command: ${cmd}`);
    return spawn(this.cliCommand.command, cmd.split(' '), { stdio: 'inherit' });
  }

  test(project: string, parameters?: dotnetTestOptions): Buffer {
    let cmd = `${this.cliCommand.command} test ${project}`;
    if (parameters) {
      parameters = swapArrayFieldValueUsingMap(parameters, 'flag', testKeyMap);
      const paramString = parameters ? getParameterString(parameters) : '';
      cmd = `${cmd} ${paramString}`;
    }
    console.log(`Executing Command: ${cmd}`);
    return this.logAndExecute(cmd);
  }

  addProjectReference(hostCsProj: string, targetCsProj: string): Buffer {
    return this.logAndExecute(
      `${this.cliCommand.command} add ${hostCsProj} reference ${targetCsProj}`
    );
  }

  private logAndExecute(cmd: string): Buffer {
    console.log(`Executing Command: ${cmd}`);
    return execSync(cmd, { stdio: 'inherit' });
  }
}
