export interface SchemaJSON {
  title: string;
  description: string;
  properties: { [key: string]: PropertyConfiguration };
  required: string[];
}

export interface PropertyConfiguration {
  type: string;
  description: string;
  alias: string[];
  oneOf?: PropertyConfiguration[];
  items: {
    type: string;
  };
  default: boolean | string | number;
  enum: string[];
}
