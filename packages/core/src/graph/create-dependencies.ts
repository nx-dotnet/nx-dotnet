import {
  CreateDependencies,
  CreateDependenciesContext,
  DependencyType,
  FileData,
  ProjectConfiguration,
  RawProjectGraphDependency,
  normalizePath,
  workspaceRoot,
} from '@nx/devkit';
import { dirname, parse, relative, resolve } from 'node:path';

import { NxDotnetConfig } from '@nx-dotnet/utils';
import { DotNetClient, dotnetFactory } from '@nx-dotnet/dotnet';

import {
  getProjectAnalysis,
  resolveProjectReference,
} from './msbuild-analyzer';

const dotnetClient = new DotNetClient(dotnetFactory(), workspaceRoot);

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

export const createDependencies: CreateDependenciesCompat<
  NxDotnetConfig
> = async (
  ctxOrOpts: CreateDependenciesContext | NxDotnetConfig | undefined,
  maybeCtx: CreateDependenciesContext | undefined,
) => {
  // In Nx version 16.8 - 16.10, CreateDependencies had a single option - the context.
  // In v17, the signature was updated to pass options first, and context second.
  const ctx: CreateDependenciesContext =
    maybeCtx ?? (ctxOrOpts as CreateDependenciesContext);
  const rootMap = createProjectRootMappings(ctx.projects);

  const parseProject = async (source: string) => {
    const changed = ctx.filesToProcess.projectFileMap[source];

    const getProjectReferences = async (file: FileData) => {
      const newDeps: RawProjectGraphDependency[] = [];
      const { ext } = parse(file.file);
      if (['.csproj', '.fsproj', '.vbproj'].includes(ext)) {
        // Try to use cached analyzer results first
        let references: string[] = [];
        try {
          const analysis = getProjectAnalysis(file.file);
          if (analysis) {
            // Use analyzer results
            references = analysis.projectReferences.map((ref) =>
              resolveProjectReference(ref, file.file),
            );
          } else {
            // Fall back to dotnet client
            references = await dotnetClient.getProjectReferencesAsync(
              file.file,
            );
          }
        } catch (error) {
          // If analyzer fails, fall back to dotnet client
          references = await dotnetClient.getProjectReferencesAsync(file.file);
        }

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
      }
      return newDeps;
    };
    const getAllProjectReferences = changed.map(getProjectReferences);
    return Promise.all(getAllProjectReferences).then((d) => d.flat());
  };

  const parseAllProjects = Object.keys(ctx.filesToProcess.projectFileMap).map(
    parseProject,
  );
  return Promise.all(parseAllProjects).then((d) => d.flat());
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
  return findProjectForPath(relative(context.workspaceRoot, resolved), rootMap);
}
