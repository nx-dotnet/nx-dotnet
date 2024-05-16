# @nx-dotnet/core:application

## NxDotnet Application Generator

Generate a dotnet project under the application directory.

## Options

### <span className="required">name</span>

- (string): The name assigned to the app

### tags

- (string): Add tags to the project (used for linting)

### directory

- (string): A directory where the project is placed

### template

- (string): The template to instantiate when the command is invoked. Each template might have specific options you can pass.

### <span className="required">language</span>

- (string): Which language should the project use?

### testTemplate

- (string): Which template should be used for creating the tests project?

### solutionFile

- (string): The name of the solution file to add the project to

- (boolean): Should the project be added to the default solution file?

### skipSwaggerLib

- (boolean): By default, if using webapi template, an additional library is scaffolded for swagger files. This skips that setup.

### pathScheme

- (string): Determines if the project should follow NX or dotnet path naming conventions

### useOpenApiGenerator

- (boolean): If using a codegen project, use openapi-generator

### args

- (array): Additional arguments to pass to the dotnet command. For example: &#34;nx g @nx-dotnet/core:app myapp --args=&#39;--no-restore&#39;&#34; Arguments can also be appended to the end of the command using &#39;--&#39;. For example, &#39;nx g @nx-dotnet/core:app myapp -- --no-restore&#39;.
