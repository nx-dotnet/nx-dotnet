import { Tree } from '@nx/devkit';

import { DotNetClient, dotnetFactory } from '@nx-dotnet/dotnet';

import { GenerateProject } from '../utils/generate-project';
import { NxDotnetGeneratorSchema } from './schema';

export default function (
  host: Tree,
  options: NxDotnetGeneratorSchema,
  dotnetClient = new DotNetClient(dotnetFactory()),
) {
  return GenerateProject(host, options, dotnetClient, 'library');
}
