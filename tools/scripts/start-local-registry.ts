/**
 * This script starts a local registry for e2e testing purposes.
 * It is meant to be called in jest's globalSetup.
 */
import { startLocalRegistry } from '@nx/js/plugins/jest/local-registry';
import { publishAll } from './publish-all';
import { copySync } from 'fs-extra';

export default async () => {
  // local registry target to run
  const localRegistryTarget = 'local-registry';
  // storage folder for the local registry
  const storage = './tmp/local-registry/storage';

  console.log('STARTING LOCAL REGISTRY');

  (global as any).stopLocalRegistry = await startLocalRegistry({
    localRegistryTarget,
    storage,
    verbose: false,
  });

  console.log('PUBLISHING PACKAGES TO LOCAL REGISTRY');
  process.env.NX_DOTNET_E2E = 'true';
  copySync('.npmrc.local', '.npmrc');
  await publishAll('99.99.99', 'local');
};
