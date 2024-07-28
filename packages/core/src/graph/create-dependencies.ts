import {
  CreateDependencies,
  CreateDependenciesContext,
  DependencyType,
  NxPluginV1,
  ProjectConfiguration,
  ProjectGraphBuilder,
  RawProjectGraphDependency,
  normalizePath,
  workspaceRoot,
} from '@nx/devkit';
import { dirname, parse, relative, resolve } from 'node:path';

import { NxDotnetConfig, readConfig } from '@nx-dotnet/utils';
import { DotNetClient, dotnetFactory } from '@nx-dotnet/dotnet';

// Between Nx versions 16.8 and 17, the signature of `CreateDependencies` changed.
// It used to only consist of the context, but now it also includes the options.
// The options were inserted as the first parameter, and the context was moved to the second.
// The following types are used to support both signatures.
type CreateDependenciesCompat<T> = {
  (
    ctx: CreateDependenciesContext,
    _: undefined,
  ): ReturnType<CreateDependencies<T>>;
  (
    opts: Parameters<CreateDependencies<T>>[0],
    ctx: CreateDependenciesContext,
  ): ReturnType<CreateDependencies<T>>;
};

const dotnetClient = new DotNetClient(dotnetFactory());

export const createDependencies: CreateDependenciesCompat<NxDotnetConfig> = (
  ctxOrOpts: CreateDependenciesContext | NxDotnetConfig | undefined,
  maybeCtx: CreateDependenciesContext | undefined,
) => {
  // In Nx version 16.8 - 16.10, CreateDependencies had a single option - the context.
  // In v17, the signature was updated to pass options first, and context second.
  const ctx: CreateDependenciesContext =
    maybeCtx ?? (ctxOrOpts as CreateDependenciesContext);

  let dependencies: RawProjectGraphDependency[] = [];
  const rootMap = createProjectRootMappings(ctx.projects);
  for (const source in ctx.filesToProcess.projectFileMap) {
    const changed = ctx.filesToProcess.projectFileMap[source];
    for (const file of changed) {
      const { ext } = parse(file.file);
      if (['.csproj', '.fsproj', '.vbproj'].includes(ext)) {
        const references = dotnetClient.getProjectReferences(file.file);
        const newDeps: RawProjectGraphDependency[] = [];
        for (const reference of references) {
          const project = resolveReferenceToProject(
            normalizePath(reference),
            file.file,
            rootMap,
            ctx,
          );
          if (project) {
            newDeps.push({
              source,
              target: project,
              type: DependencyType.static,
              sourceFile: file.file,
            });
          } else {
            console.warn(
              `Unable to resolve project for reference ${reference} in ${file.file}`,
            );
          }
        }
        dependencies = dependencies.concat(newDeps);
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

function createProjectRootMappings(
  projects: Record<string, ProjectConfiguration>,
) {
  const rootMap: Record<string, string> = {};
  for (const [, project] of Object.entries(projects)) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    rootMap[project.root!] = project.name!;
  }
  return rootMap;
}

function findProjectForPath(
  filePath: string,
  rootMap: Record<string, string>,
): string | undefined {
  /**
   * Project Mappings are in UNIX-style file paths
   * Windows may pass Win-style file paths
   * Ensure filePath is in UNIX-style
   */
  let currentPath = normalizePath(filePath);
  for (
    ;
    currentPath !== dirname(currentPath);
    currentPath = dirname(currentPath)
  ) {
    const p = rootMap[currentPath];
    if (p) {
      return p;
    }
  }
  return rootMap[currentPath];
}

export function resolveReferenceToProject(
  reference: string,
  source: string,
  rootMap: Record<string, string>,
  context: { workspaceRoot: string },
) {
  const resolved = resolve(context.workspaceRoot, dirname(source), reference);
  console.log({ reference, source, resolved });
  return findProjectForPath(relative(context.workspaceRoot, resolved), rootMap);
}
