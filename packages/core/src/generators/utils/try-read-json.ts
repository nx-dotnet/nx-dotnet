import { Tree, readJson, readJsonFile } from '@nx/devkit';

export function tryReadJson(tree: Tree, path: string) {
  try {
    return readJson(tree, path);
  } catch {
    return null;
  }
}

export function tryReadJsonFile(path: string) {
  try {
    return readJsonFile(path);
  } catch {
    return null;
  }
}
