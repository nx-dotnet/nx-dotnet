import { addProjectConfiguration, formatFiles, names, Tree } from '@nx/devkit';
import { basename } from 'path';

import {
  DotNetClient,
  dotnetFactory,
  DotnetNewOptions,
} from '@nx-dotnet/dotnet';
import { findProjectFileInPath, isNxCrystalEnabled } from '@nx-dotnet/utils';

import {
  GetBuildExecutorConfiguration,
  GetLintExecutorConfiguration,
  GetTestExecutorConfig,
} from '../../models';
import { addToSolutionFile } from '../utils/add-to-sln';
import { runDotnetAddProjectReference } from '../utils/dotnet-add';
import { runDotnetNew } from '../utils/dotnet-new';
import { readProjectConfiguration } from '../utils/project-configuration';
import { NxDotnetGeneratorSchema } from './schema';

export function normalizeOptions(
  schema: NxDotnetGeneratorSchema,
): NxDotnetGeneratorSchema & Required<Pick<NxDotnetGeneratorSchema, 'suffix'>> {
  return {
    ...schema,
    suffix: schema.suffix ?? (schema.pathScheme === 'nx' ? 'test' : 'Test'),
  };
}

export default async function (
  host: Tree,
  rawSchema: NxDotnetGeneratorSchema,
  dotnetClient = new DotNetClient(dotnetFactory()),
) {
  const schema = normalizeOptions(rawSchema);
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

  const baseCsProj = await findProjectFileInPath(targetProjectRoot, host);
  const baseNamespace = basename(baseCsProj).replace(
    /\.(csproj|vbproj|fsproj)$/,
    '',
  );

  const name =
    schema.namespaceName ??
    [baseNamespace, names(schema.suffix).className].filter(Boolean).join('.');

  const newParams: DotnetNewOptions = {
    language: schema.language,
    name,
    output: testRoot,
  };

  runDotnetNew(host, dotnetClient, schema.testTemplate, newParams);

  addToSolutionFile(host, testRoot, dotnetClient, schema.solutionFile);

  const testCsProj = await findProjectFileInPath(testRoot, host);

  runDotnetAddProjectReference(host, testCsProj, baseCsProj, dotnetClient);

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

  suffix = suffix ?? (pathScheme === 'nx' ? 'test' : 'Test');

  const name = (testProjectName =
    testProjectName ?? nameParts.concat([suffix]).join(nameSeperator));

  return {
    root: [targetProjectRoot, suffix].join(nameSeperator),
    name,
  };
}
