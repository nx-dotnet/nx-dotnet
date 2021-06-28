import { Tree } from '@nrwl/devkit';

import { DotNetClient, dotnetFactory } from '@nx-dotnet/dotnet';

import { GenerateTestProject } from '../utils/generate-project';
import { NxDotnetGeneratorSchema } from './schema';

export default function (
  host: Tree,
  options: NxDotnetGeneratorSchema,
  dotnetClient = new DotNetClient(dotnetFactory()),
) {
  return GenerateTestProject(host, options, dotnetClient);
}
