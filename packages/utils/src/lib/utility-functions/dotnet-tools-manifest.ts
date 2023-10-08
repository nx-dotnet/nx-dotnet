import { readJsonFile, workspaceRoot, logger } from '@nx/devkit';
import { existsSync } from 'fs';
import { join } from 'path';
import { DotnetToolsManifest } from '../models';

export function readDotnetToolsManifest(
  pathOverride: string | undefined = undefined,
): DotnetToolsManifest | undefined {
  const manifestPath =
    pathOverride ?? join(workspaceRoot, './.config/dotnet-tools.json');
  const manifest = existsSync(manifestPath)
    ? readJsonFile<DotnetToolsManifest>(manifestPath)
    : undefined;
  if (manifest) {
    if (manifest.version === 1) {
      return manifest;
    }
    logger.warn(
      `Could not parse dotnet tools manifest version ${manifest.version}`,
    );
  }
  return undefined;
}

export function readInstalledDotnetToolVersion(
  tool: string,
  pathOverride?: string,
): string | undefined {
  const manifest = readDotnetToolsManifest(pathOverride);
  if (!manifest) {
    return undefined;
  }
  const searchKey = tool.toLowerCase();
  const toolManifestKey = Object.keys(manifest.tools).find(
    (key) => key.toLowerCase() === searchKey,
  );
  if (toolManifestKey) {
    return manifest.tools[toolManifestKey].version;
  }
  return undefined;
}
