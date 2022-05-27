import { readJson, readJsonFile, Tree, writeJson } from '@nrwl/devkit';
import { workspaceRoot } from 'nx/src/utils/app-root';

import { CONFIG_FILE_PATH } from '../constants';
import { NxDotnetConfig } from '../models';

export const DefaultConfigValues: Partial<NxDotnetConfig> = {
  solutionFile: '{npmScope}.nx-dotnet.sln',
};

let cachedConfig: NxDotnetConfig;
export function readConfig(host?: Tree): NxDotnetConfig {
  if (host) {
    return readJson(host, CONFIG_FILE_PATH);
  } else {
    cachedConfig ??= readJsonFile(`${workspaceRoot}/${CONFIG_FILE_PATH}`);
    return cachedConfig;
  }
}

export function updateConfig(host: Tree, value: NxDotnetConfig) {
  writeJson(host, CONFIG_FILE_PATH, value);
}

export function readConfigSection<T extends keyof NxDotnetConfig>(
  host: Tree,
  section: T,
): Partial<NxDotnetConfig>[T] {
  const config = readConfig(host);
  return config[section] || DefaultConfigValues[section];
}
