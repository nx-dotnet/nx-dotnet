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

const nxPlugin: NxPluginV2 & Required<NxPluginV1> = {
  name: '@nx-dotnet/core',
  createDependencies,
  createNodes,
  projectFilePatterns,
  registerProjectTargets,
  processProjectGraph,
};

export = nxPlugin;
