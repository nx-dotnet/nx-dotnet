import { ProjectConfiguration } from '@nrwl/devkit';
import { glob } from './glob';

export async function getProjectFileForNxProject(
  project: ProjectConfiguration
) {
  const srcDirectory = project.sourceRoot;
  return glob(`${srcDirectory}/**/*.*proj`).then((x) => x[0]);
}
