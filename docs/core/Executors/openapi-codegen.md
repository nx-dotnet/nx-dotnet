# @nx-dotnet/core:openapi-codegen

## OpenapiCodegen executor

Invokes `nx g @nx-dotnet/core:swagger-typescript` with the proper parameters to update a codegen based library

## Options

### useOpenApiGenerator

- (boolean): Use the OpenAPI generator to generate the code

### openApiGeneratorTemplate

- (string): The template to use for the OpenAPI generator

### openApiGeneratorArgs

- (array): Additional arguments to pass to the OpenAPI generator

### <span className="required">openapiJsonPath</span>

- (string): Path to OpenAPI spec file

### <span className="required">outputProject</span>

- (string): Which project should hold the generated code?
