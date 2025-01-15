---
title: '@nx-dotnet/core:openapi-codegen'
---

# @nx-dotnet/core:openapi-codegen

## OpenapiCodegen executor

Invokes `nx g @nx-dotnet/core:swagger-typescript` with the proper parameters to update a codegen based library

## Options

### <span className="required">openapiJsonPath</span>

- (string): Path to OpenAPI spec file

### <span className="required">outputProject</span>

- (string): Which project should hold the generated code?

### openApiGeneratorArgs

- (array): Additional arguments to pass to the OpenAPI generator

Default: `["--global-property=models,apis"]`

### openApiGeneratorTemplate

- (string): The template to use for the OpenAPI generator

Default: `"typescript-fetch"`

### useOpenApiGenerator

- (boolean): Use the OpenAPI generator to generate the code
