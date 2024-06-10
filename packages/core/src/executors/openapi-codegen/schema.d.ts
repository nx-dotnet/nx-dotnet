export interface OpenapiCodegenExecutorSchema {
  openapiJsonPath: string;
  outputProject: string;
  useOpenApiGenerator?: boolean;
  openApiGenerator?: string;
  openApiGeneratorArgs?: string[];
}
