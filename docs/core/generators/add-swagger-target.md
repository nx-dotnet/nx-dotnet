# @nx-dotnet/core:add-swagger-target

## Swagger Target Generator

Generates a swagger setup for a given project

## Options

### swaggerDoc

- (string): Which swagger doc should be used?

### startupAssembly

- (string): Path from workspace root to the built api&#39;s startup dll file

### <span className="required">project</span>

- (string): Which project should the target be added to?

### target

- (string): What should the target be called?

### swaggerProject

- (string): What should the project created to hold the swagger files be called?

### codegenProject

- (string): What project should hold the generated types? If null, no codegen target will be added.

### useNxPluginOpenAPI

- (boolean): Should the codegen target use nx-plugin-openapi instead?
