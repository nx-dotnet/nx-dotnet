import { execSync } from 'child_process';
import {
  dotnetTemplate,
  dotnetNewOptions,
} from '../models';
import { dotnetBuildOptions } from '../models/dotnet-build/dotnet-build-options';
import { getParameterString } from '../utils/parameters';
import { LoadedCLI } from './dotnet.factory';

export class DotNetClient {
  constructor(private cliCommand: LoadedCLI) {}

  new(template: dotnetTemplate, parameters?: dotnetNewOptions): Buffer {
    const paramString = getParameterString(parameters);
    const cmd = `${this.cliCommand.command} new ${template} ${paramString}`;
    return execSync(cmd, { stdio: 'inherit' });
  }

  build(project, parameters?: dotnetBuildOptions): Buffer {
    const paramString = getParameterString(parameters);
    const cmd = `${this.cliCommand.command} build ${project} ${paramString}`;
    return execSync(cmd, {stdio: 'inherit'})
  }

  addProjectReference(hostCsProj: string, targetCsProj: string): Buffer {
    return execSync(
      `${this.cliCommand.command} add ${hostCsProj} reference ${targetCsProj}`
    );
  }
}