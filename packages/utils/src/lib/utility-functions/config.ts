import { readJson, Tree, writeJson } from '@nrwl/devkit';
import { appRootPath } from '@nrwl/tao/src/utils/app-root';
import { readJsonSync } from 'fs-extra';

import { CONFIG_FILE_PATH } from '../constants';
import { NxDotnetConfig } from '../models';

export const DefaultConfigValues: Partial<NxDotnetConfig> = {
  solutionFile: '{npmScope}.nx-dotnet.sln',
};

export function readConfig(host?: Tree): NxDotnetConfig {
  return host
    ? readJson(host, CONFIG_FILE_PATH)
    : readJsonSync(`${appRootPath}/${CONFIG_FILE_PATH}`);
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
