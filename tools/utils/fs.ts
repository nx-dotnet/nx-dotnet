import { readFileSync, statSync, writeFileSync } from 'fs';

export function existsSync(path: string) {
  let results 
  try {
    results = statSync(path);
  } catch {}
  return !!results;
}

export function readJson(path: string) {
  return JSON.parse(readFileSync(path).toString());
}

export function writeJson(path: string, object) {
  return writeFileSync(path, JSON.stringify(object, null, 2));
}
