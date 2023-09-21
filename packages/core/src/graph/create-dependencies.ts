import {
  CreateDependencies,
  ProjectGraphBuilder,
  RawProjectGraphDependency,
  workspaceRoot,
  NxPluginV1,
} from '@nx/devkit';

import { getDependenciesFromXmlFile } from '@nx-dotnet/utils';

import { parse } from 'node:path';

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
        dependencies = dependencies.concat(
          getDependenciesFromXmlFile(file.file, source, rootMap),
        );
      }
    }
  }
  return dependencies;
};

export const processProjectGraph: Required<NxPluginV1>['processProjectGraph'] =
  async (g, ctx) => {
    const builder = new ProjectGraphBuilder(g);
    const deps = await createDependencies({
      ...ctx,
      fileMap: {
        nonProjectFiles: [],
        projectFileMap: ctx.fileMap,
      },
      filesToProcess: {
        nonProjectFiles: [],
        projectFileMap: ctx.filesToProcess,
      },
      externalNodes: g.externalNodes,
      projects: ctx.projectsConfigurations.projects,
      workspaceRoot,
    });
    for (const dep of deps) {
      builder.addDependency(dep.source, dep.target, dep.type, dep.source);
    }
    return builder.getUpdatedProjectGraph();
  };
