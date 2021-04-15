import { ProjectConfiguration } from '@nrwl/devkit';
import { findProjectFileInPath } from './glob';

export async function getProjectFileForNxProject(
  project: ProjectConfiguration
) {
  const srcDirectory = project.sourceRoot;
  return findProjectFileInPath(srcDirectory);
}
