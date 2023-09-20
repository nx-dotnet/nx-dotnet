import { logger } from '@nx/devkit';

import { OpenAPIV2, OpenAPIV3, OpenAPIV3_1 } from 'openapi-types';

import { builtInTypeMap } from '../constants/swagger-ts-type-map';
import { OpenAPIPropertyDescription } from '../models/openapi-model';
import {
  TypeScriptObjectProperty,
  TypeScriptProperty,
} from '../models/typescript-model';
import { getTypeNameFromReference } from './string-utils';

export function generatePropertiesFromSchema(
  schemaProperties:
    | OpenAPIV3_1.SchemaObject['properties']
    | OpenAPIV2.SchemaObject['properties']
    | OpenAPIV3.SchemaObject['properties'],
) {
  const properties: [string, OpenAPIPropertyDescription][] = Object.entries(
    schemaProperties || {},
  );

  const typeScriptProperties: TypeScriptProperty[] = [];
  for (const [propertyName, propertyDefinition] of properties) {
    typeScriptProperties.push({
      name: propertyName,
      ...parsePropertyDefintion(propertyDefinition),
    } as TypeScriptProperty);
  }
  return typeScriptProperties;
}

export function parsePropertyDefintion(
  propertyDefinition: OpenAPIPropertyDescription,
): Omit<TypeScriptProperty, 'name'> {
  if ('$ref' in propertyDefinition) {
    if (!propertyDefinition['$ref']) {
      logger.warn(`Invalid reference in definition`);
      throw new Error('$ref should be a string');
    }
    const reference = getTypeNameFromReference(propertyDefinition['$ref']);

    return {
      type: reference,
      nullable:
        'nullable' in propertyDefinition
          ? !!propertyDefinition.nullable
          : false,
    };
  } else if (
    propertyDefinition.type &&
    typeof propertyDefinition.type === 'string' &&
    propertyDefinition.type in builtInTypeMap
  ) {
    return {
      type: builtInTypeMap[
        propertyDefinition.type as keyof typeof builtInTypeMap
      ],
      nullable:
        'nullable' in propertyDefinition
          ? !!propertyDefinition.nullable
          : false,
    };
  } else if (propertyDefinition.type === 'object') {
    return {
      type: 'object',
      properties: generatePropertiesFromSchema(propertyDefinition.properties),
      nullable:
        'nullable' in propertyDefinition ? !!propertyDefinition.nullable : true,
    } as Omit<TypeScriptObjectProperty, 'name'>;
  } else if (
    propertyDefinition.type === 'array' &&
    'items' in propertyDefinition
  ) {
    const items = propertyDefinition.items as OpenAPIPropertyDescription;
    const property = parsePropertyDefintion(items);
    if (property?.type !== 'object') {
      return {
        type: `${property?.type}[]`,
        nullable:
          'nullable' in propertyDefinition
            ? !!propertyDefinition.nullable
            : true,
      };
    }
  }
  logger.warn('Unexpected type: ' + propertyDefinition.type);
  throw new Error('Missing type mapping');
}
