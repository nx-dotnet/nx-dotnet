import { readFileSync, statSync, writeFileSync } from 'fs';
import {
  createProjectGraphAsync,
  readProjectsConfigurationFromProjectGraph,
} from '@nx/devkit';

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

export async function readProjectsConfigurations() {
  return readProjectsConfigurationFromProjectGraph(
    await createProjectGraphAsync(),
  );
}
