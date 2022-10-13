import {
  getPackageManagerCommand,
  joinPathFragments,
  ProjectConfiguration,
  TargetConfiguration,
  workspaceRoot,
} from '@nrwl/devkit';

import { execSync } from 'child_process';
import { sync } from 'fast-glob';
import { existsSync } from 'fs';
import { basename, relative, resolve } from 'path';

export function buildStartupAssemblyPath(
  projectName: string,
  project: ProjectConfiguration,
  csProjFilePath: string,
) {
  const [target, configuration] = findBuildTarget(project);
  let outputDirectory = configuration?.outputs?.[0];
  if (!outputDirectory) {
    throw new Error(`Specify the output directory for ${project.root}
      
      To generate swagger with Nx, the outputs must be captured. This is also necessary for Nx's caching mechanism.
      Simply update the outputs array in project.json with the location of your build artifacts.
      `);
  }
  outputDirectory = resolve(
    outputDirectory
      .replace('{workspaceRoot}', workspaceRoot)
      .replace('{projectRoot}', project.root),
  );
  if (!existsSync(outputDirectory)) {
    execSync(`${getPackageManagerCommand().exec} nx ${target} ${projectName}`);
  }
  const dllName = basename(csProjFilePath).replace(
    /(?:\.csproj|\.vbproj|\.fsproj)$/,
    '.dll',
  );
  const foundDll = sync(`**/${dllName}`, { cwd: outputDirectory })[0];
  if (!foundDll) {
    throw new Error(
      `[nx-dotnet] Unable to locate ${dllName} in ${relative(
        workspaceRoot,
        outputDirectory,
      )}`,
    );
  }
  return joinPathFragments(
    outputDirectory,
    sync(`**/${dllName}`, { cwd: outputDirectory })[0],
  );
}

function findBuildTarget(
  project: ProjectConfiguration,
): [string, TargetConfiguration] | [] {
  return (
    Object.entries(project?.targets || {}).find(
      ([, x]) => x.executor === '@nx-dotnet/core:build',
    ) || []
  );
}
