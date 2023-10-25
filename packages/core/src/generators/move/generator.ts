import {
  addProjectConfiguration,
  formatFiles,
  getWorkspaceLayout,
  joinPathFragments,
  names,
  normalizePath,
  offsetFromRoot,
  ProjectConfiguration,
  readProjectConfiguration,
  removeProjectConfiguration,
  Tree,
  visitNotIgnoredFiles,
} from '@nx/devkit';
import { dirname, extname, relative } from 'path';
import { MoveGeneratorSchema } from './schema';
import { getNamespaceFromSchema } from '../utils/generate-project';

type NormalizedSchema = {
  currentRoot: string;
  destinationRoot: string;
  currentProject: string;
  destinationProject: string;
  currentNamespace: string;
  destinationNamespace: string;
};

function normalizeOptions(
  tree: Tree,
  options: MoveGeneratorSchema,
): NormalizedSchema {
  const { appsDir, libsDir } = getWorkspaceLayout(tree);
  const currentRoot = readProjectConfiguration(tree, options.projectName).root;
  let destinationRoot = options.destination;
  if (!options.relativeToRoot) {
    if (currentRoot.startsWith(appsDir)) {
      destinationRoot = joinPathFragments(
        appsDir,
        options.destination.replace(new RegExp(`^${appsDir}`), ''),
      );
    } else if (currentRoot.startsWith(libsDir)) {
      destinationRoot = joinPathFragments(
        libsDir,
        options.destination.replace(new RegExp(`^${libsDir}`), ''),
      );
    }
  }

  const trimPattern = new RegExp(`^${appsDir}[/\\\\]|^${libsDir}[/\\\\]`);

  return {
    currentRoot,
    destinationRoot,
    currentProject: options.projectName,
    destinationProject: names(options.destination).fileName.replace(
      /[\\|/]/g,
      '-',
    ),
    currentNamespace: getNamespaceFromSchema(
      tree,
      currentRoot.replace(trimPattern, ''),
    ),
    destinationNamespace: getNamespaceFromSchema(
      tree,
      destinationRoot.replace(trimPattern, ''),
    ),
  };
}

export default async function (tree: Tree, options: MoveGeneratorSchema) {
  const normalizedOptions = normalizeOptions(tree, options);
  const config = readProjectConfiguration(
    tree,
    normalizedOptions.currentProject,
  );
  config.root = normalizedOptions.destinationRoot;
  config.name = normalizedOptions.destinationProject;
  removeProjectConfiguration(tree, normalizedOptions.currentProject);
  renameDirectory(
    tree,
    normalizedOptions.currentRoot,
    normalizedOptions.destinationRoot,
  );
  addProjectConfiguration(
    tree,
    options.projectName,
    transformConfiguration(tree, config, normalizedOptions),
  );

  console.log({
    originalNamespace: normalizedOptions.currentNamespace,
    newNamespace: normalizedOptions.destinationNamespace,
  });

  updateDotnetProject(tree, normalizedOptions);
  updateReferencingDotnetProjects(tree, normalizedOptions);
  await formatFiles(tree);
}

function transformConfiguration(
  tree: Tree,
  config: ProjectConfiguration,
  options: NormalizedSchema,
) {
  const copy = updateReferencesInObject(config, options);
  updateSchemaPath(tree, copy, config.root);
  return copy;
}

function updateSchemaPath(
  tree: Tree,
  config: ProjectConfiguration & { $schema?: string },
  projectRoot: string,
) {
  const relativeToRoot = offsetFromRoot(projectRoot);
  config.$schema = config.$schema?.replace(
    /^.*\/node_modules/,
    joinPathFragments(relativeToRoot, 'node_modules'),
  );
}

function updateReferencesInObject<
  // eslint-disable-next-line @typescript-eslint/ban-types
  T extends Object | Array<unknown>,
>(object: T, options: NormalizedSchema): T {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const newValue: any = Array.isArray(object)
    ? ([] as unknown as T)
    : ({} as T);
  for (const key in object) {
    if (typeof object[key] === 'string') {
      newValue[key] = (object[key] as string).replace(
        options.currentRoot,
        options.destinationRoot,
      );
    } else if (typeof object[key] === 'object') {
      newValue[key] = updateReferencesInObject(object[key] as T, options);
    } else {
      newValue[key] = object[key];
    }
  }
  return newValue;
}

function updateDotnetProject(tree: Tree, options: NormalizedSchema) {
  ['.csproj', '.vbproj', '.fsproj'].forEach((extension) => {
    const source = joinPathFragments(
      options.destinationRoot,
      `${options.currentNamespace}${extension}`,
    );
    if (tree.exists(source)) {
      const destination = joinPathFragments(
        options.destinationRoot,
        `${options.destinationNamespace}${extension}`,
      );
      tree.rename(source, destination);

      let contents = tree.read(destination)?.toString() ?? '';
      contents = contents.replaceAll(
        options.currentNamespace,
        options.destinationNamespace,
      );

      const referencePaths = contents.matchAll(
        /<ProjectReference Include="(.*)" \/>/g,
      );
      for (const match of referencePaths) {
        const path = match[1];
        const referenceFromWorkspaceRoot = joinPathFragments(
          options.currentRoot,
          path,
        );
        const adjustedPath = normalizePath(
          relative(options.destinationRoot, referenceFromWorkspaceRoot),
        );
        contents = contents.replace(path, adjustedPath);
      }

      tree.write(destination, contents);

      updateReferencingDotnetCode(tree, options.destinationRoot, options);
    }
  });
}

function updateReferencingDotnetProjects(
  tree: Tree,
  options: NormalizedSchema,
) {
  visitNotIgnoredFiles(tree, '.', (path) => {
    const extension = extname(path);
    const projectDirectory = dirname(path);
    if (['.csproj', '.vbproj', '.fsproj', '.sln'].includes(extension)) {
      const contents = tree.read(path);
      if (!contents) {
        return;
      }
      const pathToUpdate = normalizePath(
        relative(projectDirectory, options.currentRoot),
      );
      const pathToUpdateWithWindowsSeparators = pathToUpdate.replaceAll(
        '/',
        '\\',
      );
      const newPath = normalizePath(
        relative(projectDirectory, options.destinationRoot),
      );

      console.log({ pathToUpdate, newPath });

      tree.write(
        path,
        contents
          .toString()
          .replaceAll(pathToUpdate, newPath)
          .replaceAll(pathToUpdateWithWindowsSeparators, newPath)
          .replaceAll(options.currentNamespace, options.destinationNamespace),
      );

      updateReferencingDotnetCode(tree, projectDirectory, options);
    }
  });
}

function updateReferencingDotnetCode(
  tree: Tree,
  projectDirectory: string,
  options: NormalizedSchema,
) {
  visitNotIgnoredFiles(tree, projectDirectory, (path) => {
    const extension = extname(path);
    if (['.cs', '.vb', '.fs'].includes(extension)) {
      const contents = tree.read(path);
      if (!contents) {
        return;
      }

      tree.write(
        path,
        contents
          .toString()
          .replaceAll(options.currentNamespace, options.destinationNamespace),
      );
    }
  });
}

function renameDirectory(tree: Tree, from: string, to: string) {
  const children = tree.children(from);
  for (const child of children) {
    const childFrom = joinPathFragments(from, child);
    const childTo = joinPathFragments(to, child);
    if (tree.isFile(childFrom)) {
      tree.rename(childFrom, childTo);
    } else {
      renameDirectory(tree, childFrom, childTo);
    }
  }
  if (!to.startsWith(from)) {
    tree.delete(from);
  }
}
