import { ProjectConfiguration } from '@nrwl/devkit';
import { findProjectFileInPath, findProjectFileInPathSync } from './glob';

export async function getProjectFileForNxProject(
  project: ProjectConfiguration
) {
  const srcDirectory = project.root;
  return findProjectFileInPath(srcDirectory);
}

export function getProjectFileForNxProjectSync(
  project: ProjectConfiguration
) {
  const srcDirectory = project.root;
  return findProjectFileInPathSync(srcDirectory);
}
