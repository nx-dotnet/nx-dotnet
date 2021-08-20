import { readJson, Tree, writeJson } from '@nrwl/devkit';
import { appRootPath } from '@nrwl/tao/src/utils/app-root';
import { readJsonSync } from 'fs-extra';

import { CONFIG_FILE_PATH } from '../constants';
import { NxDotnetConfig } from '../models';

export function readConfig(host?: Tree): NxDotnetConfig {
  return host
    ? readJson(host, CONFIG_FILE_PATH)
    : readJsonSync(`${appRootPath}/${CONFIG_FILE_PATH}`);
}

export function updateConfig(host: Tree, value: NxDotnetConfig) {
  writeJson(host, CONFIG_FILE_PATH, value);
}
