import { NxPluginV2 } from '@nx/devkit';

import { createNodesV2 } from './graph/create-nodes';
import { createDependencies } from './graph/create-dependencies';
import { NxDotnetConfig } from '@nx-dotnet/utils';

const nxPlugin: NxPluginV2<NxDotnetConfig> = {
  name: '@nx-dotnet/core',
  createDependencies,
  createNodesV2,
};

export = nxPlugin;
