import {
  readJson,
  readJsonFile,
  Tree,
  workspaceRoot,
  writeJson,
} from '@nrwl/devkit';

import { CONFIG_FILE_PATH } from '../constants';
import { NxDotnetConfig } from '../models';

export const DefaultConfigValues: NxDotnetConfig = {
  solutionFile: '{npmScope}.nx-dotnet.sln',
  inferProjects: true,
  inferProjectTargets: true,
  nugetPackages: {},
};

let cachedConfig: NxDotnetConfig;
export function readConfig(host?: Tree): NxDotnetConfig {
  if (host) {
    return readJson(host, CONFIG_FILE_PATH);
  } else {
    try {
      cachedConfig ??= {
        ...DefaultConfigValues,
        ...readJsonFile(`${workspaceRoot}/${CONFIG_FILE_PATH}`),
      };
    } catch {
      return DefaultConfigValues;
    }
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
