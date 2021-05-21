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
  anyOf?: PropertyConfiguration[];
  items: {
    type: string;
  };
  default: boolean | string | number;
  enum: string[];
}

export interface GeneratorsCollection {
  name: string;
  version: string;
  generators: {
    [key: string]: GeneratorConfiguration;
  };
}

export interface ExecutorsCollection {
  executors: {
    [key: string]: ExecutorConfiguration;
  };
  builders: {
    [key: string]: ExecutorConfiguration;
  };
}

export interface ExecutorConfiguration {
  implementation: string;
  schema: string;
  description: string;
}

export interface GeneratorConfiguration {
  factory: string;
  schema: string;
  description: string;
}
