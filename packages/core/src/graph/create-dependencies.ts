import { CreateDependencies, RawProjectGraphDependency } from '@nx/devkit';

import { getDependenciesFromXmlFile } from '@nx-dotnet/utils';

import { parse } from 'path';

export const createDependencies: CreateDependencies = (ctx) => {
  let dependencies: RawProjectGraphDependency[] = [];
  const rootMap = Object.fromEntries(
    Object.entries(ctx.projects).map(([name, project]) => [project.root, name]),
  );
  for (const source in ctx.filesToProcess.projectFileMap) {
    const changed = ctx.filesToProcess.projectFileMap[source];
    for (const file of changed) {
      const { ext } = parse(file.file);
      if (['.csproj', '.fsproj', '.vbproj'].includes(ext)) {
        console.log('Looking at file', file.file);
        dependencies = dependencies.concat(
          getDependenciesFromXmlFile(file.file, source, rootMap),
        );
      }
    }
  }
  return dependencies;
};
