import {
  NX_VERSION,
  NxJsonConfiguration,
  readJson,
  readJsonFile,
  readNxJson,
  Tree,
  workspaceRoot,
  writeJson,
} from '@nx/devkit';

import { CONFIG_FILE_PATH } from '../constants';
import { NxDotnetConfig } from '../models';
import { major } from 'semver';

export const DefaultConfigValues: NxDotnetConfig = {
  solutionFile: '{npmScope}.nx-dotnet.sln',
  inferProjects: true,
  inferProjectTargets: true,
  nugetPackages: {},
};

export function readConfig(host?: Tree): NxDotnetConfig {
  const configFromFile = readConfigFromRCFile(host);
  const configFromNxJson = readConfigFromNxJson(host);
  return {
    ...DefaultConfigValues,
    ...configFromFile,
    ...configFromNxJson,
  };
}

export function updateConfig(host: Tree, value: NxDotnetConfig) {
  if (major(NX_VERSION) < 17) {
    writeJson(host, CONFIG_FILE_PATH, value);
  } else {
    updateConfigInNxJson(host, value);
  }
}

export function updateConfigInNxJson(host: Tree, value: NxDotnetConfig) {
  const nxJson = readNxJson(host);
  if (!nxJson) {
    throw new Error(
      'nx-dotnet requires nx.json to be present in the workspace',
    );
  }
  nxJson.plugins ??= [];
  const pluginIndex = nxJson.plugins.findIndex((p) =>
    typeof p === 'string'
      ? p === '@nx-dotnet/core'
      : p.plugin === '@nx-dotnet/core',
  );
  if (pluginIndex > -1) {
    nxJson.plugins[pluginIndex] = {
      plugin: '@nx-dotnet/core',
      // Remove cast after next beta
      options: value as unknown as Record<string, unknown>,
    };
  } else {
    throw new Error(
      'nx-dotnet requires @nx-dotnet/core to be present in nx.json',
    );
  }
  writeJson(host, 'nx.json', nxJson);
}

export function readConfigSection<T extends keyof NxDotnetConfig>(
  host: Tree,
  section: T,
): Partial<NxDotnetConfig>[T] {
  const config = readConfig(host);
  return config[section] || DefaultConfigValues[section];
}

export function readConfigFromRCFile(host?: Tree): NxDotnetConfig | null {
  try {
    if (host) {
      return readJson<NxDotnetConfig>(host, CONFIG_FILE_PATH);
    } else {
      return readJsonFile<NxDotnetConfig>(
        `${workspaceRoot}/${CONFIG_FILE_PATH}`,
      );
    }
  } catch {
    return null;
  }
}

export function readConfigFromNxJson(host?: Tree): NxDotnetConfig | null {
  if (major(NX_VERSION) < 17) {
    return null;
  }
  const nxJson: NxJsonConfiguration | null = host
    ? readNxJson(host)
    : readJsonFile(`${workspaceRoot}/nx.json`);

  const plugin = nxJson?.plugins?.find((p) =>
    typeof p === 'string'
      ? p === '@nx-dotnet/core'
      : p.plugin === '@nx-dotnet/core',
  );

  if (!plugin || typeof plugin === 'string') {
    return null;
  } else {
    return plugin.options as unknown as NxDotnetConfig;
  }
}
