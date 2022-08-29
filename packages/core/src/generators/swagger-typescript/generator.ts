import {
  formatFiles,
  generateFiles,
  joinPathFragments,
  names,
  readJson,
  Tree,
} from '@nrwl/devkit';

import * as path from 'path';

import { generateInterfacesFromDefinitions } from './build-typescript-representation/build-interfaces';
import { builtInTypes } from './constants/swagger-ts-type-map';
import { TypeScriptRepresentation } from './models/typescript-model';
import { SwaggerTypescriptGeneratorSchema } from './schema';
import { NormalizedOptions, normalizeOptions } from './utils/normalize-options';

import type { OpenAPIV2, OpenAPIV3, OpenAPIV3_1 } from 'openapi-types';
function generateInterfaceFiles(
  tree: Tree,
  interfaces: TypeScriptRepresentation[],
  options: NormalizedOptions,
) {
  const outputDirectory = joinPathFragments(
    options.outputDirectory,
    'interfaces',
  );
  for (const tsInterface of interfaces) {
    const necessaryImports = (
      tsInterface.type === 'interface'
        ? tsInterface.properties?.map((prop) => prop.type.replace(/\[\]/g, ''))
        : tsInterface.type === 'array'
        ? [tsInterface.elements]
        : []
    )?.reduce((necessary, next) => {
      if (
        next !== 'object' &&
        !builtInTypes.has(next) &&
        !necessary.has(next)
      ) {
        necessary.set(next, names(next));
      }
      return necessary;
    }, new Map<string, ReturnType<typeof names>>());

    const templateOptions = {
      ...options,
      template: '',
      tmpl: '',
      interfaceFileName: names(tsInterface.name).fileName,
      interfaceClassName: names(tsInterface.name).className,
      tsInterface,
      necessaryImports,
    };
    generateFiles(
      tree,
      path.join(__dirname, 'templates', 'interface'),
      outputDirectory,
      templateOptions,
    );
  }
}

function generateIndex(tree: Tree, options: NormalizedOptions) {
  const sourceFiles = [];
  const sourceDirectories = ['interfaces'];
  for (const directory of sourceDirectories) {
    const path = joinPathFragments(options.outputDirectory, directory);
    sourceFiles.push(
      ...tree
        .children(path)
        .filter((x) => x.endsWith('.ts'))
        .map((x) => joinPathFragments(directory, x).replace(/\.ts$/, '')),
    );
  }
  generateFiles(
    tree,
    path.join(__dirname, 'templates', 'index'),
    options.outputDirectory,
    {
      tmpl: '',
      sourceFiles,
    },
  );
}

export default async function (
  tree: Tree,
  schema: SwaggerTypescriptGeneratorSchema,
) {
  const options = normalizeOptions(tree, schema);
  const document = readJson<
    OpenAPIV2.Document | OpenAPIV3.Document | OpenAPIV3_1.Document
  >(tree, options.openapiJsonPath);

  const interfaces: TypeScriptRepresentation[] = [];

  if ('definitions' in document && document.definitions) {
    interfaces.push(...generateInterfacesFromDefinitions(document.definitions));
  }
  if ('components' in document && document.components?.schemas) {
    interfaces.push(
      ...generateInterfacesFromDefinitions(document.components.schemas),
    );
  }

  generateInterfaceFiles(tree, interfaces, options);
  generateIndex(tree, options);

  await formatFiles(tree);
}
