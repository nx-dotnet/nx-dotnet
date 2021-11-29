import { ChildProcess, execSync, spawn } from 'child_process';

import { getParameterString, swapKeysUsingMap } from '@nx-dotnet/utils';

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

  new(template: dotnetTemplate, parameters?: dotnetNewOptions): void {
    let cmd = `${this.cliCommand.command} new ${template}`;
    if (parameters) {
      parameters = swapKeysUsingMap(parameters, newKeyMap);
      const paramString = parameters ? getParameterString(parameters) : '';
      cmd = `${cmd} ${paramString}`;
    }
    return this.logAndExecute(cmd);
  }

  build(project: string, parameters?: dotnetBuildOptions): void {
    let cmd = `${this.cliCommand.command} build ${project}`;
    if (parameters) {
      parameters = swapKeysUsingMap(parameters, buildKeyMap);
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
      : `run --project ${project}`;
    if (parameters) {
      parameters = swapKeysUsingMap(parameters, runKeyMap);
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
  ): void | ChildProcess {
    let cmd = watch ? ` watch --project ${project} test` : `test ${project}`;
    cmd = `${this.cliCommand.command} ${cmd}`;

    if (parameters) {
      const mappedParameters = swapKeysUsingMap(parameters, testKeyMap);
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
  ): void {
    let cmd = `${this.cliCommand.command} add ${project} package ${pkg}`;
    if (parameters) {
      parameters = swapKeysUsingMap(parameters, addPackageKeyMap);
      const paramString = parameters ? getParameterString(parameters) : '';
      cmd = `${cmd} ${paramString}`;
    }
    return this.logAndExecute(cmd);
  }

  addProjectReference(hostCsProj: string, targetCsProj: string): void {
    return this.logAndExecute(
      `${this.cliCommand.command} add ${hostCsProj} reference ${targetCsProj}`,
    );
  }

  publish(
    project: string,
    parameters?: dotnetPublishOptions,
    publishProfile?: string,
    extraParameters?: string,
  ): void {
    let cmd = `${this.cliCommand.command} publish ${project}`;
    if (parameters) {
      parameters = swapKeysUsingMap(parameters, publishKeyMap);
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

  installTool(tool: string): void {
    const cmd = `${this.cliCommand.command} tool install ${tool}`;
    return this.logAndExecute(cmd);
  }

  restorePackages(project: string): void {
    const cmd = `${this.cliCommand.command} restore ${project}`;
    return this.logAndExecute(cmd);
  }

  restoreTools(): void {
    const cmd = `${this.cliCommand.command} tool restore`;
    return this.logAndExecute(cmd);
  }

  format(project: string, parameters?: dotnetFormatOptions): void {
    let cmd = `${this.cliCommand.command} format ${project}`;
    if (parameters) {
      parameters = swapKeysUsingMap(parameters, formatKeyMap);
      const paramString = parameters ? getParameterString(parameters) : '';
      cmd = `${cmd} ${paramString}`;
    }
    return this.logAndExecute(cmd);
  }

  addProjectToSolution(solutionFile: string, project: string) {
    const cmd = `${this.cliCommand.command} sln "${solutionFile}" add "${project}"`;
    this.logAndExecute(cmd);
  }

  getSdkVersion(): Buffer {
    const cmd = 'dotnet --version';
    return this.execute(cmd);
  }

  printSdkVersion(): void {
    this.logAndExecute('dotnet --version');
  }

  private logAndExecute(cmd: string): void {
    console.log(`Executing Command: ${cmd}`);
    execSync(cmd, { stdio: 'inherit', cwd: this.cwd || process.cwd() });
  }

  private execute(cmd: string): Buffer {
    return execSync(cmd, { cwd: this.cwd || process.cwd() });
  }
}
