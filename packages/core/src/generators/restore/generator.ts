import { Tree } from '@nx/devkit';

import { DotNetClient, dotnetFactory } from '@nx-dotnet/dotnet';
import {
  getNxDotnetProjects,
  getProjectFilesForProject,
} from '@nx-dotnet/utils';

export default async function (
  host: Tree,
  _: null, // Nx will populate this with options, which are currently unused.
  dotnetClient = new DotNetClient(dotnetFactory()),
) {
  const projects = await getNxDotnetProjects(host);
  for (const [projectName, project] of projects.entries()) {
    const projectFiles = getProjectFilesForProject(host, project, projectName);
    for (const file of projectFiles) {
      dotnetClient.restorePackages(file);
    }
  }

  dotnetClient.restoreTools();
}
