---
title: '@nx-dotnet/core:update-swagger'
---

# @nx-dotnet/core:update-swagger

## Swagger executor

Extract openapi swagger documentation from the webapi

## Options

### output

- (string): Where should the swagger output be stored

### skipInstall

- (boolean): Skips installing Swashbuckle.AspNetCore.Cli. This option should be used if you are managing the installation on your own.

### startupAssembly

- (string): Path from workspace root to the built api's startup dll file

### swaggerDoc

- (string): Which swagger doc should be used?

Default: `"v1"`
