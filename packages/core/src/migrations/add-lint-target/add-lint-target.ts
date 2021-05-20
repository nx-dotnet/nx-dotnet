import { formatFiles, Tree, updateProjectConfiguration } from '@nrwl/devkit';
import { getNxDotnetProjects } from '@nx-dotnet/utils';
import { GetLintExecutorConfiguration } from '../../models';

export default function update(host: Tree) {
  const projects = getNxDotnetProjects(host);
  for (const [name, project] of projects) {
    project.targets.lint ??= GetLintExecutorConfiguration();
    updateProjectConfiguration(host, name, project);
  }
  formatFiles(host);
}
