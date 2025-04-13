import {
  getPackageManagerCommand,
  joinPathFragments,
  ProjectConfiguration,
  TargetConfiguration,
  workspaceRoot,
} from '@nx/devkit';

import { execSync } from 'child_process';
import { sync } from 'fast-glob';
import { existsSync } from 'fs';
import { basename, relative, resolve } from 'path';
import { safeExecSync } from '@nx-dotnet/utils';

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
    safeExecSync(`${getPackageManagerCommand().exec} nx ${target} ${projectName}`, {
      windowsHide: true,
    });
  }
  const dllName = basename(csProjFilePath).replace(
    /(?:\.csproj|\.vbproj|\.fsproj)$/,
    '.dll',
  );
  const matchingDlls = sync(`**/${dllName}`, { cwd: outputDirectory });
  if (!matchingDlls.length) {
    throw new Error(
      `[nx-dotnet] Unable to locate ${dllName} in ${relative(
        workspaceRoot,
        outputDirectory,
      )}`,
    );
  }
  if (matchingDlls.length > 1) {
    throw new Error(
      `[nx-dotnet] Located multiple matching dlls for ${projectName}.

You may need to clean old build artifacts from your outputs, or manually
specify the path to the output assembly within ${project.root}/project.json.`,
    );
  }
  return joinPathFragments(outputDirectory, matchingDlls[0]);
}

function findBuildTarget(
  project: ProjectConfiguration,
): [string, TargetConfiguration] | [] {
  return (
    Object.entries(project?.targets || {}).find(
      ([, x]) => x.executor === '@nx-dotnet/core:build',
    ) ?? []
  );
}
