export type AddSwaggerJsonExecutorSchema = {
  project: string;
  projectRoot: string;
  output?: string;
  swaggerDoc?: string;
  startupAssembly?: string;
  target?: string;
  skipFormat?: boolean;
  swaggerProject?: string;
  codegenProject?: string;
  useOpenApiGenerator?: boolean;
};
