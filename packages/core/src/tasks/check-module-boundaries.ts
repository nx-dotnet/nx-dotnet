import { appRootPath } from '@nrwl/tao/src/utils/app-root';
import {
  ProjectConfiguration,
  WorkspaceJsonConfiguration,
  Workspaces,
} from '@nrwl/tao/src/shared/workspace';

import { ESLint } from 'eslint';

import {
  getDependantProjectsForNxProject,
  ModuleBoundaries,
  readConfig,
} from '@nx-dotnet/utils';
import {
  NxJsonConfiguration,
  NxJsonProjectConfiguration,
  readJsonFile,
  Tree,
} from '@nrwl/devkit';

type ExtendedWorkspaceJson = WorkspaceJsonConfiguration & {
  projects: Record<string, ProjectConfiguration & NxJsonProjectConfiguration>;
};

export async function checkModuleBoundariesForProject(
  project: string,
  workspace: ExtendedWorkspaceJson,
): Promise<string[]> {
  const projectRoot = workspace.projects[project].root;
  const tags = workspace.projects[project].tags ?? [];
  if (!tags.length) {
    //
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
    (configuration, name) => {
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
      result.rules['@nrwl/nx/enforce-module-boundaries'];
    return moduleBoundaryConfig?.depConstraints ?? [];
  } else {
    return configured;
  }
}

async function main() {
  const parser = await import('yargs-parser');
  const { project } = parser(process.argv.slice(2), {
    alias: {
      project: 'p',
    },
  });
  const workspace = new Workspaces(appRootPath);
  const workspaceJson: ExtendedWorkspaceJson =
    workspace.readWorkspaceConfiguration();
  const nxJsonProjects = readJsonFile<NxJsonConfiguration>(
    `${appRootPath}/nx.json`,
  ).projects;
  if (nxJsonProjects) {
    Object.entries(nxJsonProjects).forEach(([name, config]) => {
      const existingTags = workspaceJson.projects[name]?.tags ?? [];
      workspaceJson.projects[name].tags = [
        ...existingTags,
        ...(config.tags ?? []),
      ];
    });
  }
  console.log(`Checking module boundaries for ${project}`);
  const violations = await checkModuleBoundariesForProject(
    project,
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
  process.chdir(appRootPath);
  main();
}
