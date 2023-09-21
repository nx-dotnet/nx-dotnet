import type { OpenAPIV2, OpenAPIV3, OpenAPIV3_1 } from 'openapi-types';

import { OpenAPIPropertyDescription } from '../models/openapi-model';
import { TypeScriptRepresentation } from '../models/typescript-model';
import {
  generatePropertiesFromSchema,
  parsePropertyDefintion,
} from './parse-schema-object';

export function generateInterfacesFromDefinitions(
  definitions: Record<
    string,
    OpenAPIV3_1.SchemaObject | OpenAPIV2.SchemaObject | OpenAPIV3.SchemaObject
  >,
): TypeScriptRepresentation[] {
  const definition = Object.entries(definitions);
  const interfaces: TypeScriptRepresentation[] = [];
  for (const [name, def] of definition) {
    if (def.type === 'object') {
      interfaces.push({
        name,
        properties: generatePropertiesFromSchema(def.properties),
        type: 'interface',
      });
    } else if (def.type === 'array' && def.items) {
      const items = parsePropertyDefintion(def.items);
      interfaces.push({
        name,
        type: 'array',
        elements: items.type,
      });
    }
  }
  return interfaces;
}
