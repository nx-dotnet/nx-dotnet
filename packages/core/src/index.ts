import { NxPluginV1, NxPluginV2 } from '@nx/devkit';

import {
  createNodes,
  createNodesV2,
  projectFilePatterns,
  registerProjectTargets,
} from './graph/create-nodes';
import {
  createDependencies,
  processProjectGraph,
} from './graph/create-dependencies';
import { NxDotnetConfig } from '@nx-dotnet/utils';

const nxPlugin: NxPluginV2<NxDotnetConfig> & Required<NxPluginV1> = {
  name: '@nx-dotnet/core',
  createDependencies,
  createNodes,
  createNodesV2,
  projectFilePatterns,
  registerProjectTargets,
  processProjectGraph,
};

export = nxPlugin;
