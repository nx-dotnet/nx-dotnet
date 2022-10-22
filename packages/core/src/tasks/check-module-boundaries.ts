import {
  NxJsonConfiguration,
  ProjectConfiguration,
  readJsonFile,
  Tree,
  WorkspaceJsonConfiguration,
  workspaceRoot,
} from '@nrwl/devkit';
import { Workspaces } from '@nrwl/tao/src/shared/workspace';

import { ESLint } from 'eslint';
import { join, relative } from 'path';

import {
  getDependantProjectsForNxProject,
  ModuleBoundaries,
  readConfig,
} from '@nx-dotnet/utils';

export async function checkModuleBoundariesForProject(
  project: string,
  workspace: WorkspaceJsonConfiguration,
): Promise<string[]> {
  const projectRoot = workspace.projects[project].root;
  const tags = workspace.projects[project].tags ?? [];
  if (!tags.length) {
    return [];
  }
  const configuredConstraints = await loadModuleBoundaries(projectRoot);
  const relevantConstraints = configuredConstraints.filter(
    (x) =>
      tags.includes(x.sourceTag) && !x.onlyDependOnLibsWithTags.includes('*'),
  );
  if (!relevantConstraints.length) {
    return [];
  }

  const violations: string[] = [];
  getDependantProjectsForNxProject(
    project,
    workspace,
    (configuration, name, implicit) => {
      if (implicit) return;
      const dependencyTags = configuration?.tags ?? [];
      for (const constraint of relevantConstraints) {
        if (
          !dependencyTags.some((x) =>
            constraint.onlyDependOnLibsWithTags.includes(x),
          )
        ) {
          violations.push(
            `${project} cannot depend on ${name}. Project tag ${JSON.stringify(
              constraint,
            )} is not satisfied.`,
          );
        }
      }
    },
  );
  return violations;
}

/**
 * Loads module boundaries from eslintrc or .nx-dotnet.rc.json
 * @param root Which file should be used when pulling from eslint
 * @returns List of module boundaries
 */
export async function loadModuleBoundaries(
  root: string,
  host?: Tree,
): Promise<ModuleBoundaries> {
  const configured = readConfig(host).moduleBoundaries;
  if (!configured) {
    const result = await new ESLint()
      .calculateConfigForFile(`${root}/non-existant.ts`)
      .catch(() =>
        Promise.resolve({
          rules: { '@nrwl/nx/enforce-module-boundaries': [] },
        }),
      );
    const [, moduleBoundaryConfig] =
      result.rules['@nrwl/nx/enforce-module-boundaries'] || [];
    return moduleBoundaryConfig?.depConstraints ?? [];
  } else {
    return configured;
  }
}

async function main() {
  const parser = await import('yargs-parser');
  const { project, projectRoot } = parser(process.argv.slice(2), {
    alias: {
      project: 'p',
    },
  });
  const workspace = new Workspaces(workspaceRoot);
  const workspaceJson: WorkspaceJsonConfiguration =
    workspace.readWorkspaceConfiguration();

  // Nx v12 support
  const nxJson: NxJsonConfiguration & Record<string, ProjectConfiguration> =
    readJsonFile(join(workspaceRoot, 'nx.json'));
  if (nxJson.projects) {
    Object.entries(nxJson.projects).forEach(([name, config]) => {
      const existingTags = workspaceJson.projects[name]?.tags ?? [];
      workspaceJson.projects[name].tags = [
        ...existingTags,
        ...(config.tags ?? []),
      ];
    });
  }
  // End Nx v12 support

  let nxProject = project;
  // Find the associated nx project for the msbuild project directory.
  if (!project && projectRoot) {
    // Note that this returns the first matching project and would succeed for multiple (cs|fs...)proj under an nx project path,
    // but getProjectFileForNxProject explicitly throws if it's not exactly one.
    const [projectName] =
      Object.entries(workspaceJson.projects).find(([, projectConfig]) => {
        const relativePath = relative(projectConfig.root, projectRoot);
        return relativePath?.startsWith('..') === false;
      }) || [];

    if (projectName) {
      nxProject = projectName;
    } else {
      console.error(
        `Failed to find nx workspace project associated with dotnet project directory: ${projectRoot}`,
      );
      process.exit(1);
    }
  }

  console.log(`Checking module boundaries for ${nxProject}`);
  const violations = await checkModuleBoundariesForProject(
    nxProject,
    workspaceJson,
  );
  if (violations.length) {
    violations.forEach((error) => {
      console.error(error);
    });
    process.exit(1);
  }
  process.exit(0);
}

if (require.main === module) {
  process.chdir(workspaceRoot);
  main();
}
