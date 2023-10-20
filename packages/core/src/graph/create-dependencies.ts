import {
  CreateDependencies,
  CreateDependenciesContext,
  NxPluginV1,
  ProjectGraphBuilder,
  RawProjectGraphDependency,
  workspaceRoot,
} from '@nx/devkit';
import { parse } from 'node:path';

import {
  getDependenciesFromXmlFile,
  NxDotnetConfig,
  readConfig,
} from '@nx-dotnet/utils';

// Between Nx versions 16.8 and 17, the signature of `CreateDependencies` changed.
// It used to only consist of the context, but now it also includes the options.
// The options were inserted as the first parameter, and the context was moved to the second.
// The following types are used to support both signatures.
type CreateDependenciesV16 = (
  ctx: Parameters<CreateDependencies>[1],
  _: undefined,
) => ReturnType<CreateDependencies>;

type CreateDependenciesCompat<T> = (
  p0:
    | Parameters<CreateDependencies<T>>[0]
    | Parameters<CreateDependenciesV16>[0],
  p1:
    | Parameters<CreateDependencies<T>>[1]
    | Parameters<CreateDependenciesV16>[1],
) => ReturnType<CreateDependencies<T>>;

export const createDependencies: CreateDependenciesCompat<NxDotnetConfig> = (
  ctxOrOpts: CreateDependenciesContext | NxDotnetConfig | undefined,
  maybeCtx: CreateDependenciesContext | undefined,
) => {
  // In Nx version 16.8 - 16.10, CreateDependencies had a single option - the context.
  // In v17, the signature was updated to pass options first, and context second.
  const ctx: CreateDependenciesContext =
    maybeCtx ?? (ctxOrOpts as CreateDependenciesContext);

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
    const deps = await createDependencies(readConfig(), {
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
