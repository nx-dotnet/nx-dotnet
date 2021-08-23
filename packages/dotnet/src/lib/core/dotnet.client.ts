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
  dotnetFormatOptions,
  dotnetNewOptions,
  dotnetPublishOptions,
  dotnetRunOptions,
  dotnetTemplate,
  dotnetTestOptions,
  formatKeyMap,
  newKeyMap,
  publishKeyMap,
  runKeyMap,
  testKeyMap,
} from '../models';
import { LoadedCLI } from './dotnet.factory';

export class DotNetClient {
  constructor(private cliCommand: LoadedCLI, public cwd?: string) {}

  new(template: dotnetTemplate, parameters?: dotnetNewOptions): Buffer {
    let cmd = `${this.cliCommand.command} new ${template}`;
    if (parameters) {
      parameters = swapArrayFieldValueUsingMap(parameters, 'flag', newKeyMap);
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

  run(
    project: string,
    watch = false,
    parameters?: dotnetRunOptions,
  ): ChildProcess {
    let cmd = watch
      ? `watch --project ${project} run`
      : `run -- project ${project}`;
    if (parameters) {
      parameters = swapArrayFieldValueUsingMap(parameters, 'flag', runKeyMap);
      const paramString = parameters ? getParameterString(parameters) : '';
      cmd = `${cmd} ${paramString}`;
    }
    console.log(`Executing Command: dotnet ${cmd}`);
    return spawn(this.cliCommand.command, cmd.split(' '), {
      stdio: 'inherit',
      cwd: this.cwd,
    });
  }

  test(
    project: string,
    watch?: boolean,
    parameters?: dotnetTestOptions,
  ): Buffer | ChildProcess {
    let cmd = watch ? ` watch --project ${project} test` : `test ${project}`;
    cmd = `${this.cliCommand.command} ${cmd}`;

    if (parameters) {
      const mappedParameters = swapArrayFieldValueUsingMap(
        parameters,
        'flag',
        testKeyMap,
      );
      const paramString = getParameterString(mappedParameters);
      cmd = `${cmd} ${paramString}`;
    }
    if (!watch) {
      return this.logAndExecute(cmd);
    } else {
      console.log(`Executing Command: ${cmd}`);
      const params = cmd
        .split(' ')
        .slice(1)
        .filter((x) => x.length);
      return spawn(this.cliCommand.command, params, {
        stdio: 'inherit',
        cwd: this.cwd,
      });
    }
  }

  addPackageReference(
    project: string,
    pkg: string,
    parameters?: dotnetAddPackageOptions,
  ): Buffer {
    let cmd = `${this.cliCommand.command} add ${project} package ${pkg}`;
    if (parameters) {
      parameters = swapArrayFieldValueUsingMap(
        parameters,
        'flag',
        addPackageKeyMap,
      );
      const paramString = parameters ? getParameterString(parameters) : '';
      cmd = `${cmd} ${paramString}`;
    }
    return this.logAndExecute(cmd);
  }

  addProjectReference(hostCsProj: string, targetCsProj: string): Buffer {
    return this.logAndExecute(
      `${this.cliCommand.command} add ${hostCsProj} reference ${targetCsProj}`,
    );
  }

  publish(
    project: string,
    parameters?: dotnetPublishOptions,
    publishProfile?: string,
    extraParameters?: string,
  ): Buffer {
    let cmd = `${this.cliCommand.command} publish ${project}`;
    if (parameters) {
      parameters = swapArrayFieldValueUsingMap(
        parameters,
        'flag',
        publishKeyMap,
      );
      const paramString = parameters ? getParameterString(parameters) : '';
      cmd = `${cmd} ${paramString}`;
    }
    if (publishProfile) {
      cmd = `${cmd} -p:PublishProfile=${publishProfile}`;
    }
    if (extraParameters) {
      cmd = `${cmd} ${extraParameters}`;
    }
    return this.logAndExecute(cmd);
  }

  installTool(tool: string): Buffer {
    const cmd = `${this.cliCommand.command} tool install ${tool}`;
    return this.logAndExecute(cmd);
  }

  restorePackages(project: string): Buffer {
    const cmd = `${this.cliCommand.command} restore ${project}`;
    return this.logAndExecute(cmd);
  }

  restoreTools(): Buffer {
    const cmd = `${this.cliCommand.command} tool restore`;
    return this.logAndExecute(cmd);
  }

  format(project: string, parameters?: dotnetFormatOptions): Buffer {
    let cmd = `${this.cliCommand.command} format ${project}`;
    if (parameters) {
      parameters = swapArrayFieldValueUsingMap(
        parameters,
        'flag',
        formatKeyMap,
      );
      const paramString = parameters ? getParameterString(parameters) : '';
      cmd = `${cmd} ${paramString}`;
    }
    return this.logAndExecute(cmd);
  }

  printSdkVersion(): Buffer {
    return this.logAndExecute('dotnet --version');
  }

  private logAndExecute(cmd: string): Buffer {
    console.log(`Executing Command: ${cmd}`);
    return execSync(cmd, { stdio: 'inherit', cwd: this.cwd || process.cwd() });
  }
}
