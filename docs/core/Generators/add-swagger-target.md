# @nx-dotnet/core:add-swagger-target

## Swagger Target Generator

Add a swagger target to a webapi based project to extract swagger.json into a newly generated library project. Optionally, also creates a project for code generation of the extracted swagger specification.

## Options

### swaggerDoc

- (string): Which version of the swagger spec should be used?

### startupAssembly

- (string): Path from workspace root to the built api&amp;#39;s startup dll file. If null, will be auto-discovered.

### <span className="required">project</span>

- (string): Which project should the target be added to?

### target

- (string): What should the swagger target be called?

### swaggerProject

- (string): What should the swagger project be called?

### codegenProject

- (string): What should the codegen project be called? If null, the project will not be created.

### useNxPluginOpenAPI

- (boolean): If the codegen project is to be created, should the codegen target use nx-plugin-openapi instead? Choose false if only type interfaces are needed.
