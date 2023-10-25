import { formatFiles, Tree, updateProjectConfiguration } from '@nx/devkit';

import { getNxDotnetProjects } from '@nx-dotnet/utils';

import { GetLintExecutorConfiguration } from '../../models';

export default async function update(host: Tree) {
  const projects = await getNxDotnetProjects(host);
  for (const [name, project] of projects) {
    project.targets ??= {};
    project.targets.lint ??= GetLintExecutorConfiguration();
    updateProjectConfiguration(host, name, project);
  }
  await formatFiles(host);
}
