import { Tree, getWorkspaceLayout, readJson } from '@nx/devkit';

export function getWorkspaceScope(host: Tree) {
  // Prior to Nx 17 npm scope was included here.
  const { npmScope } = getWorkspaceLayout(host) as { npmScope?: string };
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
    const { name } = readJson<{ name: string }>(host, 'package.json');
    const parts = name?.split('/');

    if (!name || parts.length < 2) {
      return null;
    }

    return parts[0].substring(1);
  } catch {
    return null;
  }
}
