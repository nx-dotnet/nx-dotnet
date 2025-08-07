import { DotNetClient } from '@nx-dotnet/dotnet';
import { findProjectFileInPathSync } from '@nx-dotnet/utils';
import { Tree } from '@nx/devkit';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  rmdirSync,
  writeFileSync,
} from 'fs';
import { join, relative } from 'path';

export function runDotnetAddProjectToSolution(
  tree: Tree,
  dotnetClient: DotNetClient,
  projectRoot: string,
  solutionFile: string,
) {
  const relativePath = relative(dotnetClient.cwd ?? tree.root, tree.root);
  const projectFile = findProjectFileInPathSync(projectRoot, tree);
  const cleanupFns = [
    // Restore the original contents of the solution file if it existed.
    writeFileFromTree(tree, solutionFile),
    // Writes the file to disk from the tree, and returns a cleanup function.
    writeFileFromTree(tree, projectFile),
  ];
  dotnetClient.addProjectToSolution(
    join(relativePath, solutionFile),
    join(relativePath, projectRoot),
  );
  const updatedContents = readFileSync(solutionFile);
  for (const cleanup of cleanupFns) {
    cleanup();
  }
  // Writing to the tree **after** cleaning up on-disk files
  // ensures that the tree changes think its a file creation rather
  // than a file update.
  tree.write(solutionFile, updatedContents);
}

export function runDotnetAddProjectReference(
  tree: Tree,
  hostCsProj: string,
  targetCsProj: string,
  dotnetClient: DotNetClient,
) {
  const cleanupFns =
    hostCsProj === targetCsProj
      ? [writeFileFromTree(tree, hostCsProj)]
      : [
          writeFileFromTree(tree, hostCsProj),
          writeFileFromTree(tree, targetCsProj),
        ];
  dotnetClient.addProjectReference(hostCsProj, targetCsProj);
  const updatedContents = readFileSync(join(tree.root, hostCsProj)).toString();

  for (const cleanup of cleanupFns) {
    cleanup();
  }
  // Writing to the tree **after** cleaning up on-disk files
  // ensures that the tree changes think its a file creation rather
  // than a file update.
  tree.write(hostCsProj, updatedContents);
}

function writeFileFromTree(tree: Tree, path: string): () => void {
  const treeContents = tree.read(path);
  const diskPath = join(tree.root, path);
  // Restore original contents of the file if it existed when
  // calling cleanup functions.
  const onDiskContents = tryReadDiskOrNull(diskPath);
  const cleanupFns: Array<[string, () => void]> = [];
  if (treeContents) {
    if (!existsSync(tree.root)) {
      mkdirSync(tree.root);
      cleanupFns.push([
        'remove ' + tree.root,
        () => {
          rmdirSync(tree.root);
        },
      ]);
    }
    const pathSegments = path.split('/').slice(0, -1);
    let dirPath = tree.root;
    while (pathSegments.length) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      dirPath = join(dirPath, pathSegments.shift()!);
      if (!existsSync(dirPath)) {
        mkdirSync(dirPath);
        cleanupFns.push([
          'remove ' + dirPath,
          () => {
            try {
              rmdirSync(dirPath);
            } catch (e) {
              // If the directory is not empty, this will fail.
              // This is especially likely if two files from different subdirectories
              // are written into the same directory. e.g. (apps/my-app and apps/other-app).
              // In this case, if `apps` didn't exist before the first file was written,
              // we'll try to remove it when running the cleanup functions for the first file.
              // It'll fail, because the `apps/other-app` directory will still exist. This is fine.
            }
          },
        ]);
      }
    }
    if (treeContents instanceof Buffer) {
      writeFileSync(diskPath, Uint8Array.from(treeContents));
    } else {
      writeFileSync(diskPath, treeContents as any);
    }
  } else {
    console.log('No contents found in tree for', path, tree.root);
  }
  cleanupFns.push([
    onDiskContents ? 'restore ' + diskPath : 'remove ' + diskPath,
    () => {
      if (onDiskContents) {
        // Fix: writeFileSync expects string or ArrayBufferView, not Buffer
        if (onDiskContents instanceof Buffer) {
          writeFileSync(diskPath, Uint8Array.from(onDiskContents));
        } else {
          writeFileSync(diskPath, onDiskContents as any);
        }
      } else {
        rmSync(diskPath);
      }
    },
  ]);
  return () => {
    cleanupFns.reverse();
    for (const [label, cleanup] of cleanupFns) {
      if (process.env.NX_VERBOSE_LOGGING === 'true') {
        console.log('nx-dotnet cleanup:', label);
      }
      cleanup();
    }
  };
}

function tryReadDiskOrNull(path: string) {
  try {
    const filePath = join(path);
    return readFileSync(filePath);
  } catch {
    return null;
  }
}
