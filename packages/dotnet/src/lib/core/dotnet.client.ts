import { ChildProcess, execFile, spawn, spawnSync } from 'child_process';
import * as semver from 'semver';
import { promisify } from 'util';

import {
  convertOptionsToParams,
  getSpawnParameterArray,
} from '@nx-dotnet/utils';

import {
  addPackageCommandLineParamFixes,
  buildCommandLineParamFixes,
  dotnetAddPackageOptions,
  dotnetBuildOptions,
  dotnetFormatOptions,
  DotnetNewOptions,
  dotnetPublishOptions,
  dotnetRunOptions,
  DotnetTemplate,
  dotnetTestOptions,
  formatCommandLineParamFixes,
  KnownDotnetTemplates,
  newCommandLineParamFixes,
  publishCommandLineParamFixes,
  runCommandLineParamFixes,
  testCommandLineParamFixes,
} from '../models';
import { parseDotnetNewListOutput } from '../utils/parse-dotnet-new-list-output';
import { LoadedCLI } from './dotnet.factory';

export class DotNetClient {
  constructor(
    private cliCommand: LoadedCLI,
    public cwd?: string,
  ) {}

  new(
    template: KnownDotnetTemplates,
    parameters?: DotnetNewOptions,
    additionalArguments?: string[],
  ): void {
    const params = [`new`, template];
    if (parameters) {
      params.push(
        ...convertOptionsToParams(parameters, newCommandLineParamFixes),
      );
    }
    params.push(...(additionalArguments ?? []));
    return this.logAndExecute(params);
  }

  listInstalledTemplates(opts?: {
    search?: string;
    language?: string;
  }): DotnetTemplate[] {
    const version = this.getSdkVersion();
    const params: string[] = ['new'];
    if (semver.lt(version, '6.0.100') && opts?.search) {
      params.push(opts.search);
    }
    if (semver.gte(version, '7.0.100')) {
      params.push('list');
    } else {
      params.push('--list');
    }
    if (semver.gte(version, '6.0.100') && opts?.search) {
      params.push(opts.search);
    }
    if (opts?.language) {
      params.push('--language', opts.language);
    }
    const output = this.spawnAndGetOutput(params);
    return parseDotnetNewListOutput(output);
  }

  build(
    project: string,
    parameters?: dotnetBuildOptions,
    extraParameters?: string,
  ): void {
    const params = [`build`, project];
    if (parameters) {
      params.push(
        ...convertOptionsToParams(parameters, buildCommandLineParamFixes),
      );
    }
    if (extraParameters) {
      const matches = extraParameters.match(EXTRA_PARAMS_REGEX);
      params.push(...(matches as string[]));
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
      params.push(
        ...convertOptionsToParams(parameters, runCommandLineParamFixes),
      );
    }

    return this.logAndSpawn(params);
  }

  test(
    project: string,
    watch?: boolean,
    parameters?: dotnetTestOptions,
    extraParameters?: string,
  ): void | ChildProcess {
    const params = watch
      ? [`watch`, `--project`, project, `test`]
      : [`test`, project];

    if (parameters) {
      params.push(
        ...convertOptionsToParams(parameters, testCommandLineParamFixes),
      );
    }
    if (extraParameters) {
      const matches = extraParameters.match(EXTRA_PARAMS_REGEX);
      params.push(...(matches as string[]));
    }
    if (!watch) {
      return this.logAndExecute(params);
    } else {
      return this.logAndSpawn(params);
    }
  }

  addPackageReference(
    project: string,
    pkg: string,
    parameters?: dotnetAddPackageOptions,
  ): void {
    const params = [`add`, project, `package`, pkg];
    if (parameters) {
      params.push(
        ...convertOptionsToParams(parameters, addPackageCommandLineParamFixes),
      );
    }
    return this.logAndExecute(params);
  }

  addProjectReference(hostCsProj: string, targetCsProj: string): void {
    return this.logAndExecute([`add`, hostCsProj, `reference`, targetCsProj]);
  }

  publish(
    project: string,
    parameters?: dotnetPublishOptions,
    publishProfile?: string,
    extraParameters?: string,
  ): void {
    const params = [`publish`, `"${project}"`];
    if (parameters) {
      params.push(
        ...convertOptionsToParams(parameters, publishCommandLineParamFixes),
      );
    }
    if (publishProfile) {
      params.push(`-p:PublishProfile=${publishProfile}`);
    }
    if (extraParameters) {
      const matches = extraParameters.match(EXTRA_PARAMS_REGEX);
      params.push(...(matches as string[]));
    }
    return this.logAndExecute(params);
  }

  installTool(tool: string, version?: string, source?: string): void {
    const cmd = [`tool`, `install`, tool];
    if (version) {
      cmd.push('--version', version);
    }
    if (source) {
      cmd.push('--add-source', source);
    }
    return this.logAndExecute(cmd);
  }

  restorePackages(project: string): void {
    const cmd = [`restore`, project];
    return this.logAndExecute(cmd);
  }

  restoreTools(): void {
    const cmd = [`tool`, `restore`];
    return this.logAndExecute(cmd);
  }

  format(
    project: string,
    parameters?: dotnetFormatOptions,
    forceToolUsage?: boolean,
  ): void {
    const params = getFormatBaseArgv(forceToolUsage);

    parameters = updateFormatParametersForVersionCompatibility(
      this.getSdkVersion(),
      parameters,
    );

    if (
      semver.major(this.getSdkVersion()) >= 6 &&
      (parameters?.fixWhitespace !== undefined ||
        parameters?.fixStyle !== undefined ||
        parameters?.fixAnalyzers !== undefined)
    ) {
      // The handling of these 3 options changed in .NET 6.
      // Now, we need to run the command separately for each option that isn't disabled
      // if any of them were disabled or modified.
      const whitespace = parameters.fixWhitespace;
      const style = parameters.fixStyle;
      const analyzers = parameters.fixAnalyzers;
      delete parameters.fixWhitespace;
      delete parameters.fixStyle;
      delete parameters.fixAnalyzers;

      if (whitespace !== false) {
        const subcommandParams = [...params, 'whitespace', project];
        const subcommandParameterObject = {
          ...parameters,
        };
        subcommandParams.push(
          ...convertOptionsToParams(
            subcommandParameterObject,
            formatCommandLineParamFixes,
          ),
        );
        this.logAndExecute(subcommandParams);
      }
      if (style !== false) {
        const subcommandParams = [...params, 'style', project];
        const subcommandParameterObject: dotnetFormatOptions & {
          severity?: string;
        } = {
          ...parameters,
        };
        if (typeof style === 'string') {
          subcommandParameterObject.severity = style;
        }
        subcommandParams.push(
          ...convertOptionsToParams(
            subcommandParameterObject,
            formatCommandLineParamFixes,
          ),
        );
        this.logAndExecute(subcommandParams);
      }
      if (analyzers !== false) {
        const subcommandParams = [...params, 'analyzers', project];
        const subcommandParameterObject: dotnetFormatOptions & {
          severity?: string;
        } = {
          ...parameters,
        };
        if (typeof analyzers === 'string') {
          subcommandParameterObject.severity = analyzers;
        }
        subcommandParams.push(
          ...convertOptionsToParams(
            subcommandParameterObject,
            formatCommandLineParamFixes,
          ),
        );
        this.logAndExecute(subcommandParams);
      }
    } else {
      params.push(project);
      if (parameters) {
        params.push(
          ...convertOptionsToParams(parameters, formatCommandLineParamFixes),
        );
      }
      return this.logAndExecute(params);
    }
  }

  runTool<T extends Record<string, string | boolean>>(
    tool: string,
    positionalParameters?: string[],
    parameters?: T,
    extraParameters?: string,
  ) {
    const params = ['tool', 'run', tool];

    if (positionalParameters) {
      params.push(...positionalParameters);
    }

    if (parameters) {
      params.push(...getSpawnParameterArray(parameters));
    }

    if (extraParameters) {
      const matches = extraParameters.match(EXTRA_PARAMS_REGEX);
      params.push(...(matches as string[]));
    }

    return this.logAndExecute(params);
  }

  addProjectToSolution(solutionFile: string, project: string) {
    const params = [`sln`, solutionFile, `add`, project];
    this.logAndExecute(params);
  }

  getProjectReferences(projectFile: string): string[] {
    const output = this.spawnAndGetOutput(['list', projectFile, 'reference']);
    // Output looks like:
    // ```
    // HEADER
    // -------------------
    // A
    // B
    // C
    // ```
    return output
      .split('\n')
      .slice(2)
      .map((line) => line.trim())
      .filter(Boolean);
  }

  async getProjectReferencesAsync(projectFile: string): Promise<string[]> {
    const output = await this.spawnAsyncAndGetOutput([
      'list',
      projectFile,
      'reference',
    ]);
    return output
      .split('\n')
      .slice(2)
      .map((line) => line.trim())
      .filter(Boolean);
  }

  getSdkVersion(): string {
    return this.cliCommand.info.version.toString();
  }

  printSdkVersion(): void {
    this.logAndExecute(['--version']);
  }

  public logAndExecute(params: string[]): void {
    params = params.map((param) =>
      param.replace(/\$(\w+)/, (_, varName) => process.env[varName] ?? ''),
    );

    const cmd = `${this.cliCommand.command} "${params.join('" "')}"`;
    console.log(`Executing Command: ${cmd}`);

    const res = spawnSync(this.cliCommand.command, params, {
      cwd: this.cwd ?? process.cwd(),
      stdio: 'inherit',
      windowsHide: true,
    });
    if (res.status !== 0) {
      throw new Error(`dotnet execution returned status code ${res.status}`);
    }
  }

  private spawnAndGetOutput(params: string[]): string {
    params = params.map((param) =>
      param.replace(/\$(\w+)/, (_, varName) => process.env[varName] ?? ''),
    );

    const res = spawnSync(this.cliCommand.command, params, {
      cwd: this.cwd ?? process.cwd(),
      stdio: 'pipe',
      windowsHide: true,
    });
    if (res.status !== 0) {
      throw new Error(
        `dotnet execution returned status code ${res.status} \n ${res.stderr}`,
      );
    }
    return res.stdout.toString();
  }
  async spawnAsyncAndGetOutput(params: string[]): Promise<string> {
    params = params.map((param) =>
      param.replace(/\$(\w+)/, (_, varName) => process.env[varName] ?? ''),
    );

    try {
      const { stdout } = await promisify(execFile)(
        this.cliCommand.command,
        params,
        {
          cwd: this.cwd ?? process.cwd(),
          windowsHide: true,
          timeout: 10000,
          killSignal: 'SIGKILL',
        },
      ).catch((e) => {
        if ('code' in e && 'stderr' in e) {
          throw new Error(
            `dotnet execution returned status code ${e.code} \n ${e.message}`,
          );
        }
        throw e;
      });
      if (stdout.includes('There are no Project to Project')) {
        return '';
      }
      return stdout;
    } catch (error) {
      // Log warning instead of throwing to prevent breaking project graph calculation
      console.warn(
        `Warning: Failed to execute dotnet command: ${this.cliCommand.command} ${params.join(' ')}`,
        error,
      );
      return '';
    }
  }

  private logAndSpawn(params: string[]): ChildProcess {
    console.log(
      `Executing Command: ${this.cliCommand.command} "${params.join('" "')}"`,
    );
    return spawn(this.cliCommand.command, params, {
      stdio: 'inherit',
      cwd: this.cwd ?? process.cwd(),
      windowsHide: true,
    });
  }
}

/**
 * Regular Expression for Parsing Extra Params before sending to spawn / exec
 * First part of expression matches parameters such as --flag="my answer"
 * Second part of expression matches parameters such as --flag=my_answer
 */
const EXTRA_PARAMS_REGEX = /\S*".+?"|\S+/g;

function getFormatBaseArgv(forceToolUsage?: boolean) {
  return forceToolUsage ? ['tool', 'run', 'dotnet-format', '--'] : [`format`];
}

function updateFormatParametersForVersionCompatibility(
  sdkVersion: string,
  parameters?: dotnetFormatOptions,
) {
  // The --check flag is for .NET 5 and older
  // The --verify-no-changes flag is for .NET 6 and newer
  // They do the same thing, but the flag name changed in .NET 6, so we need to handle that.
  if (parameters) {
    if (semver.major(sdkVersion) >= 6) {
      parameters.verifyNoChanges ??= parameters.check;
      delete parameters.check;
    } else {
      parameters.check ??= parameters.verifyNoChanges;
      delete parameters.verifyNoChanges;
    }
  }
  return parameters;
}
