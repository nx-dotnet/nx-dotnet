---
title: '@nx-dotnet/core:application'
---

# @nx-dotnet/core:application

## NxDotnet Application Generator

Generate a dotnet project under the application directory.

## Options

### <span className="required">language</span>

- (string): Which language should the project use?

### <span className="required">name</span>

- (string): The name assigned to the app

### args

- (array): Additional arguments to pass to the dotnet command. For example: "nx g @nx-dotnet/core:app myapp --args='--no-restore'" Arguments can also be appended to the end of the command using '--'. For example, 'nx g @nx-dotnet/core:app myapp -- --no-restore'.

Default: `[]`

### directory

- (string): A directory where the project is placed

### namespaceName

- (string): The namespace for the project. If not provided, will be generated based on project name and directory.

### pathScheme

- (string): Determines if the project should follow NX or dotnet path naming conventions

Default: `"nx"`

### skipSwaggerLib

- (boolean): By default, if using webapi template, an additional library is scaffolded for swagger files. This skips that setup.

### solutionFile

- (string): The name of the solution file to add the project to

- (boolean): Should the project be added to the default solution file?

### tags

- (string): Add tags to the project (used for linting)

### template

- (string): The template to instantiate when the command is invoked. Each template might have specific options you can pass.

### testTemplate

- (string): Which template should be used for creating the tests project?

Default: `"nunit"`

### useOpenApiGenerator

- (boolean): If using a codegen project, use openapi-generator

Default: `true`
