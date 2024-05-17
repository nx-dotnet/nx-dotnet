import {
  addProjectConfiguration,
  formatFiles,
  joinPathFragments,
  names,
  Tree,
} from '@nx/devkit';

import {
  DotNetClient,
  dotnetFactory,
  dotnetNewOptions,
} from '@nx-dotnet/dotnet';
import {
  findProjectFileInPath,
  isDryRun,
  isNxCrystalEnabled,
} from '@nx-dotnet/utils';

import {
  GetBuildExecutorConfiguration,
  GetLintExecutorConfiguration,
  GetTestExecutorConfig,
} from '../../models';
import { addToSolutionFile } from '../utils/add-to-sln';
import { getNamespaceFromRoot } from '../utils/generate-project';
import { readProjectConfiguration } from '../utils/project-configuration';
import { NxDotnetGeneratorSchema } from './schema';

export default async function (
  host: Tree,
  schema: NxDotnetGeneratorSchema,
  dotnetClient = new DotNetClient(dotnetFactory()),
) {
  const targetProject = await readProjectConfiguration(
    host,
    schema.targetProject,
  );
  const targetProjectRoot = targetProject.root;
  const targetProjectName = schema.targetProject;

  const { name: testProjectName, root: testRoot } =
    calculateTestTargetNameAndRoot(
      schema.pathScheme,
      targetProjectName,
      targetProjectRoot,
      schema.testProjectName,
      schema.suffix,
    );

  if (!isNxCrystalEnabled()) {
    addProjectConfiguration(host, testProjectName, {
      root: testRoot,
      projectType: 'library',
      sourceRoot: `${testRoot}`,
      targets: {
        build: GetBuildExecutorConfiguration(testRoot),
        test: GetTestExecutorConfig(),
        lint: GetLintExecutorConfiguration(),
      },
      tags: schema.tags
        ? Array.isArray(schema.tags)
          ? schema.tags
          : schema.tags.split(',').map((tag) => tag.trim())
        : [],
    });
  }

  const namespaceName = getNamespaceFromRoot(host, targetProjectRoot);

  const newParams: dotnetNewOptions = {
    language: schema.language,
    name:
      namespaceName +
      (schema.suffix ? '.' + names(schema.suffix).className : ''),
    output: testRoot,
  };

  if (isDryRun()) {
    newParams['dryRun'] = true;
  }

  dotnetClient.new(schema.testTemplate, newParams);
  if (!isDryRun()) {
    addToSolutionFile(host, testRoot, dotnetClient, schema.solutionFile);

    const testCsProj = await findProjectFileInPath(testRoot);
    const baseCsProj = await findProjectFileInPath(targetProjectRoot);
    dotnetClient.addProjectReference(testCsProj, baseCsProj);
  }

  if (!schema.skipFormat) {
    await formatFiles(host);
  }
}

export function calculateTestTargetNameAndRoot(
  pathScheme: 'nx' | 'dotnet',
  targetProjectName: string,
  targetProjectRoot: string,
  testProjectName?: string,
  suffix?: string,
): { root: string; name: string } {
  const nameSeperator = pathScheme === 'nx' ? '-' : '.';
  const nameParts = targetProjectName.split(nameSeperator);
  const rootPathSegments = targetProjectRoot.split('/');
  rootPathSegments.pop(); // Remove the last segment, which is the target project name.

  suffix = suffix ?? (pathScheme === 'nx' ? 'test' : 'Test');

  testProjectName =
    testProjectName ?? nameParts.concat([suffix]).join(nameSeperator);

  const testProjectRootBasenameParts = testProjectName.split(nameSeperator);

  rootloop: for (let i = 0; i < rootPathSegments.length; i++) {
    const segment = rootPathSegments[i];
    // If we run into a path segment that matches the first part of the project name
    // its possible that the project root's basename shouldn't contain that segment of the
    // name. E.g. if the project name is `domain-existing-app` and the project root
    // is `apps/domain/existing-app`, the basename is "existing-app", not "domain-existing-app".
    //
    // If we detect that the current path segment is the first part of the project name
    // and the following segments match more of the project name, we remove these segments
    // from the new test project's name parts.
    if (segment === nameParts[0]) {
      let matchingSegments = 1;
      for (; matchingSegments < nameParts.length; matchingSegments++) {
        // If we run out of path segments, we break the loop - the rest
        // of the nameparts should be in the new project's root basename.
        if (i + matchingSegments >= rootPathSegments.length) {
          break;
        }

        // We found a segment later in the path which doesn't match the project name.
        if (
          rootPathSegments[i + matchingSegments] !== nameParts[matchingSegments]
        ) {
          continue rootloop;
        }
      }

      // If we reach this point, we found a match for the project name in the path.
      // We need to remove these segments from the new project's root basename.
      for (let j = 0; j < matchingSegments; j++) {
        testProjectRootBasenameParts.shift();
      }
    }
  }

  const testProjectRoot = joinPathFragments(
    ...rootPathSegments,
    testProjectRootBasenameParts.join(nameSeperator),
  );
  return {
    root: testProjectRoot,
    name: testProjectName,
  };
}
