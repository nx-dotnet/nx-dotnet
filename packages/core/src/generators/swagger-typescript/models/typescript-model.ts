export type TypeScriptRepresentation =
  | TypeScriptInterface
  | TypeScriptArrayType;

export type TypeScriptArrayType = {
  name: string;
  type: 'array';
  elements: string;
};

export interface TypeScriptInterface {
  name: string;
  type: 'interface';
  properties?: TypeScriptProperty[];
}

export type TypeScriptProperty =
  | TypeScriptLiteralProperty
  | TypeScriptObjectProperty;
export type TypeScriptBaseProperty = {
  name: string;
};
export type TypeScriptLiteralProperty = TypeScriptBaseProperty & {
  type: 'string' | 'number' | 'boolean' | string;
};
export interface TypeScriptObjectProperty extends TypeScriptBaseProperty {
  type: 'object';
  properties?: TypeScriptProperty[];
}
