import { readJson, Tree, writeJson } from '@nrwl/devkit';

import { CONFIG_FILE_PATH } from '../constants';
import { NxDotnetConfig } from '../models';

export function readConfig(host: Tree): NxDotnetConfig {
  return readJson(host, CONFIG_FILE_PATH);
}

export function updateConfig(host: Tree, value: NxDotnetConfig) {
  writeJson(host, CONFIG_FILE_PATH, value);
}
