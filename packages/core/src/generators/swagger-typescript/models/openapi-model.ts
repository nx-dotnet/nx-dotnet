import { OpenAPIV2, OpenAPIV3, OpenAPIV3_1 } from 'openapi-types';

export type OpenAPIPropertyDescription =
  | OpenAPIV2.SchemaObject
  | OpenAPIV3.SchemaObject
  | OpenAPIV3_1.SchemaObject
  | OpenAPIV3.ReferenceObject
  | OpenAPIV3_1.ReferenceObject;
