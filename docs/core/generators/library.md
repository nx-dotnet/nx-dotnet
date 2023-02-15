# @nx-dotnet/core:library

## NxDotnet Library Generator

Generate a dotnet project under the library directory.

## Options

### <span className="required">name</span>

- (string): The name assigned to the library

### tags

- (string): Add tags to the project (used for linting)

### directory

- (string): A directory where the project is placed

### template

- (string): The template to instantiate when the command is invoked. Each template might have specific options you can pass.

### <span className="required">language</span>

- (string): Which language should the project use?

### <span className="required">testTemplate</span>

- (string): Which template should be used for creating the tests project?

### solutionFile

- (string): The name of the solution file to add the project to

- (boolean): Should the project be added to the default solution file?

### skipSwaggerLib

- (boolean): By default, if using webapi template, an additional library is scaffolded for swagger files. This skips that setup.

### pathScheme

- (string): Determines if the project should follow NX or dotnet path naming conventions
