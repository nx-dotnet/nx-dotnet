import { readNxJson, Tree } from '@nx/devkit';

import { parse } from 'path';

import { DotNetClient, dotnetFactory } from '@nx-dotnet/dotnet';
import { readConfigSection } from '@nx-dotnet/utils';
import { getWorkspaceScope } from './get-scope';
import { runDotnetNew } from './dotnet-new';
import { runDotnetAddProjectToSolution } from './dotnet-add';
import { tryReadJson } from './try-read-json';

export function addToSolutionFile(
  host: Tree,
  projectRoot: string,
  dotnetClient = new DotNetClient(dotnetFactory()),
  solutionFile?: string | boolean,
) {
  const scope = getWorkspaceScope(
    readNxJson(host),
    tryReadJson(host, 'package.json'),
  );
  const defaultFilePath = readConfigSection(host, 'solutionFile')?.replace(
    /(\{npmScope\}|\{scope\})/g,
    scope || '',
  );
  if (typeof solutionFile === 'boolean' && solutionFile) {
    solutionFile = defaultFilePath;
  } else if (solutionFile === null || solutionFile === undefined) {
    if (defaultFilePath && host.exists(defaultFilePath)) {
      solutionFile = defaultFilePath;
    }
  }

  if (solutionFile) {
    if (!host.exists(solutionFile)) {
      const { name, dir } = parse(solutionFile);
      runDotnetNew(host, dotnetClient, 'sln', {
        name,
        output: dir,
      });
    }
    runDotnetAddProjectToSolution(
      host,
      dotnetClient,
      projectRoot,
      solutionFile,
    );
  }
}
