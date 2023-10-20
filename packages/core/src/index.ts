import { NxPluginV1, NxPluginV2 } from '@nx/devkit';

import {
  createNodes,
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
  projectFilePatterns,
  registerProjectTargets,
  processProjectGraph,
};

export = nxPlugin;
