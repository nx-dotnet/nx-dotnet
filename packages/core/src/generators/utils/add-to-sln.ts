import {
  joinPathFragments,
  readWorkspaceConfiguration,
  Tree,
} from '@nrwl/devkit';

import { parse, relative, resolve } from 'path';

import { DotNetClient, dotnetFactory } from '@nx-dotnet/dotnet';
import { readConfigSection } from '@nx-dotnet/utils';

export function addToSolutionFile(
  host: Tree,
  projectRoot: string,
  dotnetClient = new DotNetClient(dotnetFactory()),
  solutionFile?: string | boolean,
) {
  const workspaceConfiguration = readWorkspaceConfiguration(host);
  const defaultFilePath = readConfigSection(host, 'solutionFile')?.replace(
    '{npmScope}',
    workspaceConfiguration.npmScope || '',
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
      dotnetClient.new('sln', {
        name,
        output: dir,
      });
    }
    const relativePath = relative(dotnetClient.cwd || host.root, host.root);
    dotnetClient.addProjectToSolution(
      joinPathFragments(relativePath, solutionFile),
      resolve(relativePath, projectRoot),
    );
  }
}
