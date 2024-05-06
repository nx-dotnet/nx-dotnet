import { Tree } from '@nx/devkit';

import { DotNetClient, dotnetFactory } from '@nx-dotnet/dotnet';
import {
  getNxDotnetProjects,
  getProjectFilesForProject,
} from '@nx-dotnet/utils';
import { getSolutionFile } from '../utils/solution-file';
import { NxDotnetRestoreGeneratorSchema } from './schema';

export default async function (
  host: Tree,
  options: NxDotnetRestoreGeneratorSchema,
  dotnetClient = new DotNetClient(dotnetFactory()),
) {
  const solutionFile = getSolutionFile(host, options.solutionFile);
  const projectsInSolution = new Set<string>();
  if (solutionFile && host.exists(solutionFile)) {
    dotnetClient.restorePackages(solutionFile);

    for (const project of dotnetClient.getProjectsInSolution(solutionFile)) {
      projectsInSolution.add(project);
    }
  }

  const projects = await getNxDotnetProjects(host);
  for (const [projectName, project] of projects.entries()) {
    const projectFiles = getProjectFilesForProject(host, project, projectName);
    for (const file of projectFiles) {
      if (!projectsInSolution.has(file)) {
        dotnetClient.restorePackages(file);
      }
    }
  }

  dotnetClient.restoreTools();
}
