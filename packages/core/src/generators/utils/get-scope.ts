import { NxJsonConfiguration } from '@nx/devkit';
import type { PackageJson } from 'nx/src/utils/package-json';

export function getWorkspaceScope(
  nxJson: NxJsonConfiguration | null,
  rootPackageJson?: PackageJson,
) {
  const { workspaceLayout } = (nxJson ?? {}) as any;

  // Prior to Nx 17 npm scope was included here.
  const { npmScope } = workspaceLayout ?? {};
  if (npmScope) {
    return npmScope;
  }

  const fromPackageJson = getScopeFromPackageJson(rootPackageJson);
  if (fromPackageJson) {
    return fromPackageJson;
  }

  return null;
}

/**
 * Get the org scope from the package.json file
 */
function getScopeFromPackageJson(packageJson?: PackageJson) {
  try {
    const { name } = packageJson ?? {};
    const parts = name?.split('/');

    if (!name || !parts || parts.length < 2) {
      return null;
    }

    return parts[0].substring(1);
  } catch {
    return null;
  }
}
