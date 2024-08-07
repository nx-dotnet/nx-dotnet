---
title: '@nx-dotnet/core:library'
---

# @nx-dotnet/core:library

## NxDotnet Library Generator

Generate a dotnet project under the library directory.

## Options

### <span class="required">name</span>

- (string): The name assigned to the library

### namespaceName

- (string): The namespace for the project. If not provided, will be generated based on project name and directory.

### tags

- (string): Add tags to the project (used for linting)

### directory

- (string): A directory where the project is placed

### template

- (string): The template to instantiate when the command is invoked. Each template might have specific options you can pass.

### <span class="required">language</span>

- (string): Which language should the project use?

### <span class="required">testTemplate</span>

- (string): Which template should be used for creating the tests project?

Default: `"nunit"`

### solutionFile

- (string): The name of the solution file to add the project to

- (boolean): Should the project be added to the default solution file?

### skipSwaggerLib

- (boolean): By default, if using webapi template, an additional library is scaffolded for swagger files. This skips that setup.

Default: `true`

### pathScheme

- (string): Determines if the project should follow NX or dotnet path naming conventions

Default: `"nx"`

### args

- (array): Additional arguments to pass to the dotnet command. For example: "nx g @nx-dotnet/core:app myapp --args='--no-restore'" Arguments can also be appended to the end of the command using '--'. For example, 'nx g @nx-dotnet/core:app myapp -- --no-restore'.

Default: `[]`
