import { formatFiles, Tree } from '@nrwl/devkit';
import { execSync } from 'child_process';
import { resolve } from 'path';

export default async function (host: Tree, schema: any) {
  execSync('nx build nxdoc');
  const path = resolve('dist/packages/nxdoc/src');
  const generateDocs = require(path).generateDocs;
  await generateDocs(host, { outputDirectory: 'docs' });
  await formatFiles(host);
}
