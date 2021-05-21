export interface SchemaJSON {}

export interface GeneratorsCollection {
  name: string;
  version: string;
  generators: {
      [key: string]: GeneratorConfiguration
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
