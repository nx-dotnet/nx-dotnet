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

let dotnetClient: DotNetClient | null = null;

/**
 * Reset the dotnet client cache - used for testing
 */
export function resetDotnetClient(): void {
  dotnetClient = null;
}

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

  // Early return if no project files to process to avoid infinite loops
  if (
    !ctx.filesToProcess.projectFileMap ||
    Object.keys(ctx.filesToProcess.projectFileMap).length === 0
  ) {
    return [];
  }

  // Check if there are any .NET project files to process
  const hasDotnetProjects = Object.values(ctx.filesToProcess.projectFileMap)
    .flat()
    .some((file) => {
      const { ext } = parse(file.file);
      return ['.csproj', '.fsproj', '.vbproj'].includes(ext);
    });

  // Early return if no .NET projects found
  if (!hasDotnetProjects) {
    return [];
  }

  const rootMap = createProjectRootMappings(ctx.projects);

  // Wrap the entire dependency resolution in a timeout to prevent infinite loops
  const dependencyResolutionPromise = (async () => {
    // Lazy initialization of dotnet client only when we have .NET projects
    if (!dotnetClient) {
      try {
        dotnetClient = new DotNetClient(dotnetFactory(), workspaceRoot);
      } catch (error) {
        console.warn('Failed to initialize .NET client:', error);
        return [];
      }
    }

    const parseProject = async (source: string) => {
      const changed = ctx.filesToProcess.projectFileMap[source];

      const getProjectReferences = async (file: FileData) => {
        const newDeps: RawProjectGraphDependency[] = [];
        const { ext } = parse(file.file);
        if (['.csproj', '.fsproj', '.vbproj'].includes(ext)) {
          if (!dotnetClient) {
            console.warn('Dotnet client not initialized');
            return newDeps;
          }
          try {
            const references = await dotnetClient.getProjectReferencesAsync(
              file.file,
            );
            for (const reference of references) {
              // Skip empty, null, or undefined references
              if (
                !reference ||
                typeof reference !== 'string' ||
                reference.trim() === ''
              ) {
                continue;
              }

              const project = resolveReferenceToProject(
                reference,
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
          } catch (error) {
            console.warn(
              `Failed to get project references for ${file.file}:`,
              error,
            );
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
  })();

  // Add a timeout to the entire operation to prevent infinite loops
  const timeoutPromise = new Promise<RawProjectGraphDependency[]>(
    (_, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Dependency resolution timed out after 30 seconds'));
      }, 30000);

      // Use unref() to prevent the timeout from keeping the process alive
      timeoutId.unref();
    },
  );

  try {
    return await Promise.race([dependencyResolutionPromise, timeoutPromise]);
  } catch (error) {
    console.warn('Failed to resolve .NET project dependencies:', error);
    return [];
  }
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
  // Normalize both paths to handle Windows backslashes consistently
  const normalizedReference = normalizePath(reference);
  const normalizedSource = normalizePath(source);

  // If the reference is already "absolute" (doesn't start with ./ or ../),
  // treat it as relative to workspace root
  let resolved: string;
  if (
    normalizedReference.startsWith('./') ||
    normalizedReference.startsWith('../')
  ) {
    // Relative reference - resolve from the source file's directory
    resolved = resolve(
      context.workspaceRoot,
      dirname(normalizedSource),
      normalizedReference,
    );
  } else {
    // "Absolute" reference - relative to workspace root
    resolved = resolve(context.workspaceRoot, normalizedReference);
  }

  return findProjectForPath(
    normalizePath(relative(context.workspaceRoot, resolved)),
    rootMap,
  );
}
