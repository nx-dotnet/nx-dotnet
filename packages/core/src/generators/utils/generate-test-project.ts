import { addProjectConfiguration, Tree } from '@nrwl/devkit';
import { DotNetClient, dotnetNewOptions } from '@nx-dotnet/dotnet';
import { findProjectFileInPath, isDryRun } from '@nx-dotnet/utils';
import {
  GetBuildExecutorConfiguration,
  GetLintExecutorConfiguration,
  GetTestExecutorConfig,
  NxDotnetTestGeneratorSchema,
} from '../../models';
import {
  NormalizedSchema,
  normalizeOptions,
  addDryRunParameter,
  SetOutputPath,
} from './generate-project';

export async function GenerateTestProject(
  host: Tree,
  schema: NxDotnetTestGeneratorSchema | NormalizedSchema,
  dotnetClient: DotNetClient,
) {
  if (!('projectRoot' in schema)) {
    schema = normalizeOptions(host, schema);
  }

  const testRoot = schema.projectRoot + '-test';
  const testProjectName = schema.projectName + '-test';

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

  const newParams: dotnetNewOptions = [
    {
      flag: 'language',
      value: schema.language,
    },
    {
      flag: 'name',
      value: schema.namespaceName + '.Test',
    },
    {
      flag: 'output',
      value: schema.projectRoot + '-test',
    },
  ];

  if (isDryRun()) {
    addDryRunParameter(newParams);
  }

  dotnetClient.new(schema.testTemplate, newParams);

  if (!isDryRun() && !schema.skipOutputPathManipulation) {
    const testCsProj = await findProjectFileInPath(testRoot);
    SetOutputPath(host, testRoot, testCsProj);
    const baseCsProj = await findProjectFileInPath(schema.projectRoot);
    SetOutputPath(host, schema.projectRoot, baseCsProj);
    dotnetClient.addProjectReference(testCsProj, baseCsProj);
  }
}
