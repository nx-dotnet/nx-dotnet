import { addProjectConfiguration, names, Tree } from '@nrwl/devkit';

import { DotNetClient, dotnetNewOptions } from '@nx-dotnet/dotnet';
import { findProjectFileInPath, isDryRun } from '@nx-dotnet/utils';

import {
  GetBuildExecutorConfiguration,
  GetLintExecutorConfiguration,
  GetTestExecutorConfig,
} from '../../models';
import { addToSolutionFile } from './add-to-sln';

import {
  NormalizedSchema,
  normalizeOptions,
  manipulateXmlProjectFile,
} from './generate-project';

export async function GenerateTestProject(
  host: Tree,
  schema: NormalizedSchema,
  dotnetClient: DotNetClient,
) {
  if (!('projectRoot' in schema)) {
    schema = normalizeOptions(host, schema);
  }

  const suffix = schema.testProjectNameSuffix || 'test';
  const testRoot = schema.projectRoot + '-' + suffix;
  const testProjectName = schema.projectName + '-' + suffix;

  addProjectConfiguration(
    host,
    testProjectName,
    {
      root: testRoot,
      projectType: schema.projectType,
      sourceRoot: `${testRoot}`,
      targets: {
        build: GetBuildExecutorConfiguration(testRoot),
        test: GetTestExecutorConfig(),
        lint: GetLintExecutorConfiguration(),
      },
      tags: schema.parsedTags,
    },
    schema.standalone,
  );

  const newParams: dotnetNewOptions = {
    language: schema.language,
    name: schema.namespaceName + '.' + names(suffix).className,
    output: schema.projectRoot + '-' + suffix,
  };

  if (isDryRun()) {
    newParams['dryRun'] = true;
  }

  dotnetClient.new(schema.testTemplate, newParams);
  if (!isDryRun()) {
    addToSolutionFile(host, testRoot, dotnetClient, schema.solutionFile);
  }

  if (!isDryRun() && !schema.skipOutputPathManipulation) {
    await manipulateXmlProjectFile(host, {
      ...schema,
      projectRoot: testRoot,
      projectName: testProjectName,
    });
    const testCsProj = await findProjectFileInPath(testRoot);
    const baseCsProj = await findProjectFileInPath(schema.projectRoot);
    dotnetClient.addProjectReference(testCsProj, baseCsProj);
  }
}
