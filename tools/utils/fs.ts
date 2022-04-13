import { Workspaces } from '@nrwl/tao/src/shared/workspace';

import { readFileSync, statSync, writeFileSync } from 'fs';
import { join } from 'path';
import { format } from 'prettier';

export function existsSync(path: string) {
  let results;
  try {
    results = statSync(path);
  } catch {}
  return !!results;
}

export function readJson(path: string) {
  return JSON.parse(readFileSync(path).toString());
}

export function writeJson(path: string, object: any) {
  const contents = format(JSON.stringify(object, null, 2), {
    parser: 'json',
  });
  return writeFileSync(path, contents);
}

export function readWorkspaceJson() {
  return new Workspaces(join(__dirname, '../../')).readWorkspaceConfiguration();
}
