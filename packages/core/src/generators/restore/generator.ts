import { Tree } from '@nrwl/devkit';
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
  const projects = getNxDotnetProjects(host);
  for (const project of projects.values()) {
    const projectFiles = getProjectFilesForProject(host, project);
    for (const file of projectFiles) {
      dotnetClient.restorePackages(file);
    }
  }

  dotnetClient.restoreTools();
}
