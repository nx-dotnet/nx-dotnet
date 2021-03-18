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
    const cmdParams: cmdLineParameter[] = parameters.map((x) => ({
      ...x,
      flag: dotnetNewFlagMap[x.flag] || x.flag,
    }));
    const paramString = getParameterString(cmdParams);
    const cmd = `${this.cliCommand.command} new ${template} ${paramString}`;
    return execSync(cmd);
  }

  addProjectReference(hostCsProj: string, targetCsProj: string): Buffer {
    return execSync(
      `${this.cliCommand.command} add ${hostCsProj} reference ${targetCsProj}`
    );
  }
}

export const dotnetNewFlagMap: { [key in dotnetNewFlags]?: string } = {
  dryRun: 'dry-run',
  nugetSource: 'nuget-source',
  updateApply: 'update-apply',
  updateCheck: 'update-check',
};
