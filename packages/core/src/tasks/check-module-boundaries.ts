import {
  createProjectGraphAsync,
  ProjectGraph,
  ProjectGraphProjectNode,
  Tree,
  workspaceRoot,
} from '@nx/devkit';

import { relative } from 'path';

import {
  forEachDependantProject,
  ModuleBoundaries,
  ModuleBoundary,
  readConfig,
} from '@nx-dotnet/utils';

export async function checkModuleBoundariesForProject(
  project: string,
  graph: ProjectGraph,
): Promise<string[]> {
  const projectRoot = graph.nodes[project].data.root;
  const tags = graph.nodes[project].data.tags ?? [];
  if (!tags.length) {
    return [];
  }
  const constraints = await getProjectConstraints(projectRoot, tags);
  if (!constraints.length) {
    return [];
  }

  const violations: string[] = [];
  forEachDependantProject(project, graph, (configuration, name, implicit) => {
    if (implicit) return;
    const dependencyTags = configuration?.tags ?? [];
    for (const constraint of constraints) {
      if (hasConstraintViolation(constraint, dependencyTags)) {
        violations.push(
          `${project} cannot depend on ${name}. Project tag ${JSON.stringify(
            constraint,
          )} is not satisfied.`,
        );
      }
    }
  });
  return violations;
}

async function getProjectConstraints(root: string, tags: string[]) {
  const configuredConstraints = await loadModuleBoundaries(root);
  return configuredConstraints.filter(
    (x) =>
      ((x.sourceTag && hasMatch(tags, x.sourceTag)) ||
        x.allSourceTags?.every((tag) => hasMatch(tags, tag))) &&
      (!x.onlyDependOnLibsWithTags?.includes('*') ||
        x.notDependOnLibsWithTags?.length),
  );
}

function hasConstraintViolation(
  constraint: ModuleBoundary,
  dependencyTags: string[],
) {
  return (
    !dependencyTags.some((x) =>
      hasMatch(constraint.onlyDependOnLibsWithTags ?? [], x),
    ) ||
    dependencyTags.some((x) =>
      hasMatch(constraint.notDependOnLibsWithTags ?? [], x),
    )
  );
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
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { ESLint }: typeof import('eslint') = require('eslint');
      const result = await new ESLint()
        .calculateConfigForFile(`${root}/non-existant.ts`)
        .catch(() =>
          Promise.resolve({
            rules: { '@nx/enforce-module-boundaries': [] },
          }),
        );
      const [, moduleBoundaryConfig] =
        result.rules['@nx/enforce-module-boundaries'] ||
        result.rules['@nrwl/nx/enforce-module-boundaries'] ||
        [];
      return moduleBoundaryConfig?.depConstraints ?? [];
    } catch (e) {
      return [];
    }
  } else {
    return configured;
  }
}

function findProjectGivenRoot(root: string, graph: ProjectGraph): string {
  // Note that this returns the first matching project and would succeed for multiple (cs|fs...)proj under an nx project path,
  // but getProjectFileForNxProject explicitly throws if it's not exactly one.
  const normalizedRoot = root.replace(/^["'](.+(?=["']$))["']$/, '$1');
  const projectNode = Object.values(graph.nodes).find(
    (projectConfig: ProjectGraphProjectNode) => {
      const relativePath = relative(projectConfig.data.root, normalizedRoot);
      return relativePath?.startsWith('..') === false;
    },
  );

  const projectName = projectNode?.name;

  if (projectName) {
    return projectName;
  } else {
    console.error(
      `Failed to find nx workspace project associated with dotnet project directory: ${root}`,
    );
    process.exit(1);
  }
}

const regexMap = new Map<string, RegExp>();

function hasMatch(input: string[], pattern: string): boolean {
  if (pattern === '*') return true;

  // if the pattern is a regex, check if any of the input strings match the regex
  if (pattern.startsWith('/') && pattern.endsWith('/')) {
    let regex = regexMap.get(pattern);
    if (!regex) {
      regex = new RegExp(pattern.substring(1, pattern.length - 1));
      regexMap.set(pattern, regex);
    }
    return input.some((t) => regex?.test(t));
  }

  // if the pattern is a glob, check if any of the input strings match the glob prefix
  if (pattern.includes('*')) {
    const regex = mapGlobToRegExp(pattern);
    return input.some((t) => regex.test(t));
  }

  return input.indexOf(pattern) > -1;
}

/**
 * Maps import with wildcards to regex pattern
 * @param importDefinition
 * @returns
 */
function mapGlobToRegExp(importDefinition: string): RegExp {
  // we replace all instances of `*`, `**..*` and `.*` with `.*`
  const mappedWildcards = importDefinition.split(/(?:\.\*)|\*+/).join('.*');
  return new RegExp(`^${new RegExp(mappedWildcards).source}$`);
}

async function main() {
  const parser = await import('yargs-parser');
  const { project, projectRoot } = parser(process.argv.slice(2), {
    alias: {
      project: 'p',
    },
    string: ['project', 'projectRoot'],
  }) as { project?: string; projectRoot?: string };
  const graph = await createProjectGraphAsync();

  // Find the associated nx project for the msbuild project directory.
  const nxProject: string =
    project ?? findProjectGivenRoot(projectRoot as string, graph);

  console.log(`Checking module boundaries for ${nxProject}`);
  const violations = await checkModuleBoundariesForProject(nxProject, graph);
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
