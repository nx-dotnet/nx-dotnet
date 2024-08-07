# Swagger projects and targets

As of v1.11.0, `nx-dotnet` supports generating code-generated projects from your .NET webapi projects.

## How it works

Newly generated projects (`@nx-dotnet/core:application`/`@nx-dotnet/core:library`) can optionally create 2 swagger related libraries:

- enabled when `skipSwaggerLib=false`
- libs/generated/{project}-swagger
- libs/generated/{project}-types

1. A `swagger` target is added to the generated webapi project which leverages [Swashbuckle.AspNetCore](https://github.com/domaindrivendev/Swashbuckle.AspNetCore) to extract a `swagger.json` spec file.
   - The swagger.json file is output to the `-swagger` project.
2. The `-types` project is created containing a typescript client for consuming the webapi
   - A `codegen` target is added to the webapi project to refresh this library
   - The typescript client can be produced in 2 flavors:
     1. Interfaces only - with `useNxPluginOpenApi = false`
     2. A full fetch based implementation - with `useNxPluginOpenApi = true`. Note: Java 8 is a pre-requisite for running this plugin.
3. Nx dependencies ensure that the project targets are properly rebuilt whenever changes are made to the webapi
4. To manually refresh the generated client, use `nx codegen {project}-types`

## How to use it

From your typescript projects, the generated library can be used via `import '@MyWorkspace/MyTypesProject'`. Invoke it as you would any other imported code.

## Customizations

To change the generated client type (default is "typescript-fetch"), edit the options in the `codegen` target.

- For example, to use `typescript-angular` to generate a complete angular service implementation
  ```
  "targets": {
    "codegen": {
      "executor": "@trumbitta/nx-plugin-openapi:generate-api-lib-sources",
      "options": {
        "generator": "typescript-angular",
        "sourceSpecPathOrUrl": "libs/generated/api-swagger/swagger.json"
      },
      "dependsOn": ["^swagger"]
    }
  }
  ```
- Many other generators exist, see [openapi-generator-tools](https://openapi-generator.tech/docs/generators/)
