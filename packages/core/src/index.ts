import { NxPlugin } from '@nrwl/devkit';
import {
  projectFilePatterns,
  registerProjectTargets,
} from './graph/infer-project';
import { processProjectGraph } from './graph/process-project-graph';

const nxPlugin: NxPlugin = {
  name: '@nx-dotnet/core',
  processProjectGraph,
  registerProjectTargets,
  projectFilePatterns,
};

export = nxPlugin;
