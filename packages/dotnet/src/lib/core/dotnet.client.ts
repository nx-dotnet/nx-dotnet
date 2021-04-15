import { ChildProcess, execSync, spawn } from 'child_process';
import { dotnetBuildOptions, dotnetTemplate, dotnetNewOptions, dotnetRunOptions } from '../models';
import { getParameterString } from '@nx-dotnet/utils';
import { LoadedCLI } from './dotnet.factory';

export class DotNetClient {
  constructor(private cliCommand: LoadedCLI) {}
  
  new(template: dotnetTemplate, parameters?: dotnetNewOptions): Buffer {
    const paramString = getParameterString(parameters);
    const cmd = `${this.cliCommand.command} new ${template} ${paramString}`;
    return this.logAndExecute(cmd);
  }
  
  build(project, parameters?: dotnetBuildOptions): Buffer {
    const paramString = getParameterString(parameters);
    const cmd = `${this.cliCommand.command} build ${project} ${paramString}`;
    return this.logAndExecute(cmd);
  }
  
  run(project, parameters?: dotnetRunOptions): ChildProcess {
    const paramString = getParameterString(parameters);
    const cmd = `${this.cliCommand} run ${project} ${paramString}`
    console.log(`Executing Command: ${cmd}`);
    return spawn(cmd, {stdio: 'inherit'});
  }

  addProjectReference(hostCsProj: string, targetCsProj: string): Buffer {
    return this.logAndExecute(
      `${this.cliCommand.command} add ${hostCsProj} reference ${targetCsProj}`
    );
  }

  private logAndExecute(cmd): Buffer {
    console.log(`Executing Command: ${cmd}`);
    return execSync(cmd, { stdio: 'inherit' });
  }
}
