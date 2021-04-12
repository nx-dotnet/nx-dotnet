import { execSync } from 'child_process';
import {
  dotnetTemplate,
  dotnetNewOptions,
  dotnetNewFlags,
  cmdLineParameter,
} from '../models';
import { getParameterString } from '../utils/parameters';
import { LoadedCLI } from './dotnet.factory';

export class DotNetClient {
  constructor(private cliCommand: LoadedCLI) {}

  new(template: dotnetTemplate, parameters?: dotnetNewOptions): Buffer {
    const paramString = getParameterString(parameters);
    const cmd = `${this.cliCommand.command} new ${template} ${paramString}`;
    return execSync(cmd, { stdio: 'inherit' });
  }

  build(csproj) {
  }

  addProjectReference(hostCsProj: string, targetCsProj: string): Buffer {
    return execSync(
      `${this.cliCommand.command} add ${hostCsProj} reference ${targetCsProj}`
    );
  }
}