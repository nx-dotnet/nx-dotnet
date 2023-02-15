import { readProjectConfiguration, Tree } from '@nrwl/devkit';

import { DotNetClient, dotnetFactory } from '@nx-dotnet/dotnet';

import { NxDotnetProjectGeneratorSchema } from '../../models';
import { normalizeOptions } from '../utils/generate-project';
import { GenerateTestProject } from '../utils/generate-test-project';
import { NxDotnetGeneratorSchema } from './schema';

export default async function (
  host: Tree,
  options: NxDotnetGeneratorSchema,
  dotnetClient = new DotNetClient(dotnetFactory()),
) {
  // Reconstruct the original parameters as if the test project were generated at the same time as the target project.
  const project = readProjectConfiguration(host, options.name);
  const projectPaths = project.root.split('/');
  const directory = projectPaths.slice(1, -1).join('/'); // The middle portions contain the original path.
  const [name] = projectPaths.slice(-1); // The final folder contains the original name.

  const projectGeneratorOptions: NxDotnetProjectGeneratorSchema = {
    ...options,
    testProjectNameSuffix: options.suffix,
    name,
    language: options.language,
    testTemplate: options.testTemplate,
    directory,
    tags: project.tags?.join(','),
    template: '',
    projectType: project.projectType ?? 'library',
    skipSwaggerLib: true,
  };

  const normalizedOptions = await normalizeOptions(
    host,
    projectGeneratorOptions,
  );

  return GenerateTestProject(host, normalizedOptions, dotnetClient);
}
