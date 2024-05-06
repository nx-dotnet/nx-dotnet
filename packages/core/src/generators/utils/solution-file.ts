import { joinPathFragments, Tree } from '@nx/devkit';

import { parse, relative, resolve } from 'path';

import { DotNetClient, dotnetFactory } from '@nx-dotnet/dotnet';
import { readConfigSection } from '@nx-dotnet/utils';
import { getWorkspaceScope } from './get-scope';

export function addToSolutionFile(
  host: Tree,
  projectRoot: string,
  dotnetClient = new DotNetClient(dotnetFactory()),
  solutionFile?: string | boolean,
) {
  const normalizedSolutionFile = getSolutionFile(host, solutionFile);

  if (normalizedSolutionFile) {
    if (!host.exists(normalizedSolutionFile)) {
      const { name, dir } = parse(normalizedSolutionFile);
      dotnetClient.new('sln', {
        name,
        output: joinPathFragments(host.root, dir),
      });
    }
    const relativePath = relative(dotnetClient.cwd ?? host.root, host.root);
    dotnetClient.addProjectToSolution(
      joinPathFragments(relativePath, normalizedSolutionFile),
      resolve(relativePath, projectRoot),
    );
  }
}

export function getSolutionFile(
  host: Tree,
  solutionFile: string | boolean | null | undefined,
): string | undefined {
  if (!solutionFile) {
    return undefined;
  }
  const scope = getWorkspaceScope(host);
  const defaultFilePath = readConfigSection(host, 'solutionFile')?.replace(
    /(\{npmScope\}|\{scope\})/g,
    scope || '',
  );
  if (typeof solutionFile === 'boolean' && solutionFile) {
    return defaultFilePath;
  }
  if (solutionFile === null || solutionFile === undefined) {
    if (defaultFilePath && host.exists(defaultFilePath)) {
      return defaultFilePath;
    }
    return undefined;
  }
  return solutionFile;
}
