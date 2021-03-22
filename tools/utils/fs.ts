import { statSync } from 'fs';

export function existsSync(path: string) {
  const results = statSync(path);
  return !!results;
}
