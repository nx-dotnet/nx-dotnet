import {
  joinPathFragments,
  ProjectConfiguration,
  readProjectConfiguration,
  Tree,
} from '@nx/devkit';

import { SwaggerTypescriptGeneratorSchema } from '../schema';

export interface NormalizedOptions extends SwaggerTypescriptGeneratorSchema {
  outputProjectConfiguration: ProjectConfiguration;
  outputDirectory: string;
}
export function normalizeOptions(
  tree: Tree,
  options: SwaggerTypescriptGeneratorSchema,
): NormalizedOptions {
  const outputProject = readProjectConfiguration(tree, options.outputProject);
  const outputDirectory = joinPathFragments(
    outputProject.sourceRoot ?? joinPathFragments(outputProject.root, 'src'),
  );
  return {
    ...options,
    outputProjectConfiguration: outputProject,
    outputDirectory,
  };
}
