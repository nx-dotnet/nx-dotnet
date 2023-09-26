import { Tree, getWorkspaceLayout, readJson } from '@nx/devkit';
import type { PackageJson } from 'nx/src/utils/package-json';

export function getWorkspaceScope(host: Tree) {
  const { npmScope } = getWorkspaceLayout(host);
  if (npmScope) {
    return npmScope;
  }

  const fromPackageJson = getScopeFromPackageJson(host);
  if (fromPackageJson) {
    return fromPackageJson;
  }

  return null;
}

/**
 * Get the org scope from the package.json file
 */
function getScopeFromPackageJson(host: Tree) {
  try {
    const { name } = readJson<PackageJson>(host, 'package.json');
    const parts = name?.split('/');

    if (!name || parts.length < 2) {
      return null;
    }

    return parts[0].substring(1);
  } catch {
    return null;
  }
}
