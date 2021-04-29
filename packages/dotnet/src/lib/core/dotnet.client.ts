import { ChildProcess, execSync, spawn } from 'child_process';

import {
  getParameterString,
  swapArrayFieldValueUsingMap,
} from '@nx-dotnet/utils';

import {
  addPackageKeyMap,
  buildKeyMap,
  dotnetAddPackageOptions,
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
    let cmd = `${this.cliCommand.command} new ${template}`;
    if (parameters) {
      parameters = swapArrayFieldValueUsingMap(parameters, 'flag', testKeyMap);
      const paramString = parameters ? getParameterString(parameters) : '';
      cmd = `${cmd} ${paramString}`;
    }
    return this.logAndExecute(cmd);
  }

  build(project: string, parameters?: dotnetBuildOptions): Buffer {
    let cmd = `${this.cliCommand.command} build ${project}`;
    if (parameters) {
      parameters = swapArrayFieldValueUsingMap(parameters, 'flag', buildKeyMap);
      const paramString = parameters ? getParameterString(parameters) : '';
      cmd = `${cmd} ${paramString}`;
    }
    return this.logAndExecute(cmd);
  }

  run(project: string, parameters?: dotnetRunOptions): ChildProcess {
    let cmd = `run --project ${project} `;
    if (parameters) {
      parameters = swapArrayFieldValueUsingMap(parameters, 'flag', testKeyMap);
      const paramString = parameters ? getParameterString(parameters) : '';
      cmd = `${cmd} ${paramString}`;
    }
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

  addPackageReference(
    project: string,
    pkg: string,
    parameters?: dotnetAddPackageOptions
  ): Buffer {
    let cmd = `${this.cliCommand.command} add ${project} package ${pkg}`;
    if (parameters) {
      parameters = swapArrayFieldValueUsingMap(
        parameters,
        'flag',
        addPackageKeyMap
      );
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
