import { NxPluginV2 } from '@nx/devkit';

import { createNodes } from './graph/create-nodes';
import { createDependencies } from './graph/create-dependencies';

const nxPlugin: NxPluginV2 = {
  name: '@nx-dotnet/core',
  createDependencies,
  createNodes,
};

export = nxPlugin;
