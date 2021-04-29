import { Tree } from '@nrwl/devkit';

import { SyncGeneratorSchema } from './schema';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default async function (host: Tree, options: SyncGeneratorSchema) {
  console.log('Syncing dependencies between project files and config...');
}
