import { getParameterArrayStrings, swapKeysUsingMap } from '@nx-dotnet/utils';
import { ChildProcess, execSync, spawn } from 'child_process';

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
    const params = [`new`, template];
    if (parameters) {
      parameters = swapKeysUsingMap(parameters, newKeyMap);
      params.push(...getParameterArrayStrings(parameters));
    }
    return this.logAndExecute(params);
  }

  build(project: string, parameters?: dotnetBuildOptions): Buffer {
    const params = [`build`, project];
    if (parameters) {
      parameters = swapKeysUsingMap(parameters, buildKeyMap);
      params.push(...getParameterArrayStrings(parameters));
    }
    return this.logAndExecute(params);
  }

  run(
    project: string,
    watch = false,
    parameters?: dotnetRunOptions,
  ): ChildProcess {
    const params = watch
      ? [`watch`, `--project`, project, `run`]
      : [`run`, `--project`, project];
    if (parameters) {
      parameters = swapKeysUsingMap(parameters, runKeyMap);
      params.push(...getParameterArrayStrings(parameters));
    }

    return this.logAndSpawn(params);
  }

  test(
    project: string,
    watch?: boolean,
    parameters?: dotnetTestOptions,
  ): Buffer | ChildProcess {
    const params = watch
      ? [`watch`, `--project`, project, `test`]
      : [`test`, project];

    if (parameters) {
      parameters = swapKeysUsingMap(parameters, testKeyMap);
      params.push(...getParameterArrayStrings(parameters));
    }
    if (!watch) {
      return this.logAndExecute(params);
    } else {
      const slicedParams = params.slice(1).filter((x) => x.length);
      return this.logAndSpawn(slicedParams);
    }
  }

  addPackageReference(
    project: string,
    pkg: string,
    parameters?: dotnetAddPackageOptions,
  ): Buffer {
    const params = [`add`, project, `package`, pkg];
    if (parameters) {
      parameters = swapKeysUsingMap(parameters, addPackageKeyMap);
      params.push(...getParameterArrayStrings(parameters));
    }
    return this.logAndExecute(params);
  }

  addProjectReference(hostCsProj: string, targetCsProj: string): Buffer {
    return this.logAndExecute([`add`, hostCsProj, `reference`, targetCsProj]);
  }

  publish(
    project: string,
    parameters?: dotnetPublishOptions,
    publishProfile?: string,
    extraParameters?: string,
  ): Buffer {
    const params = [`publish`, `"${project}"`];
    if (parameters) {
      parameters = swapKeysUsingMap(parameters, publishKeyMap);
      params.push(...getParameterArrayStrings(parameters));
    }
    if (publishProfile) {
      params.push(`-p:PublishProfile=${publishProfile}`);
    }
    if (extraParameters) {
      params.push(`${extraParameters}`);
    }
    return this.logAndExecute(params);
  }

  installTool(tool: string): Buffer {
    const cmd = [`tool`, `install`, tool];
    return this.logAndExecute(cmd);
  }

  restorePackages(project: string): Buffer {
    const cmd = [`restore`, project];
    return this.logAndExecute(cmd);
  }

  restoreTools(): Buffer {
    const cmd = [`tool`, `restore`];
    return this.logAndExecute(cmd);
  }

  format(project: string, parameters?: dotnetFormatOptions): Buffer {
    const params = [`format`, project];
    if (parameters) {
      parameters = swapKeysUsingMap(parameters, formatKeyMap);
      params.push(...getParameterArrayStrings(parameters));
    }
    return this.logAndExecute(params);
  }

  addProjectToSolution(solutionFile: string, project: string) {
    const params = [`sln`, solutionFile, `add`, project];
    this.logAndExecute(params);
  }

  getSdkVersion(): Buffer {
    return this.execute(['--version']);
  }

  printSdkVersion(): void {
    this.logAndExecute(['--version']);
  }

  private logAndExecute(params: string[]): Buffer {
    console.log(
      `Executing Command: ${this.cliCommand.command} ${params.join(', ')}`,
    );
    return this.execute(params);
  }

  private execute(params: string[]): Buffer {
    return execSync([this.cliCommand.command, ...params].join(), {
      cwd: this.cwd || process.cwd(),
    });
  }

  private logAndSpawn(params: string[]): ChildProcess {
    console.log(
      `Executing Command: ${this.cliCommand.command} ${params.join(', ')}`,
    );
    return spawn(this.cliCommand.command, params, {
      stdio: 'inherit',
      cwd: this.cwd || process.cwd(),
    });
  }
}
