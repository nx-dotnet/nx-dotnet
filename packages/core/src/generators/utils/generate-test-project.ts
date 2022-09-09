import { addProjectConfiguration, names, Tree } from '@nrwl/devkit';

import { DotNetClient, dotnetNewOptions } from '@nx-dotnet/dotnet';
import { isDryRun } from '@nx-dotnet/utils';

import {
  GetBuildExecutorConfiguration,
  GetLintExecutorConfiguration,
  GetTestExecutorConfig,
} from '../../models';
import { addToSolutionFile } from './add-to-sln';
import { NormalizedSchema, normalizeOptions } from './generate-project';
export interface PathParts {
  suffix: string;
  separator: '.' | '-';
}

function getPathPartsFromSchema(schema: NormalizedSchema): PathParts {
  if (schema.pathScheme === 'nx') {
    return {
      separator: '-',
      suffix: schema.testProjectNameSuffix || 'test',
    };
  } else {
    return {
      separator: '.',
      suffix: schema.testProjectNameSuffix || 'Test',
    };
  }
}

export async function GenerateTestProject(
  host: Tree,
  schema: NormalizedSchema,
  dotnetClient: DotNetClient,
) {
  if (!('projectRoot' in schema)) {
    schema = await normalizeOptions(host, schema);
  }

  const { separator, suffix } = getPathPartsFromSchema(schema);
  const testRoot = schema.projectRoot + separator + suffix;
  const testProjectName = schema.projectName + separator + suffix;

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
    output: testRoot,
  };

  if (isDryRun()) {
    newParams['dryRun'] = true;
  }

  dotnetClient.new(schema.testTemplate, newParams);
  if (!isDryRun()) {
    addToSolutionFile(host, testRoot, dotnetClient, schema.solutionFile);
  }
}
