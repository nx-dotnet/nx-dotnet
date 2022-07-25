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

### skipOutputPathManipulation

- (boolean): Skip XML changes for default build path

### standalone

- (boolean): Should the project use project.json? If false, the project config is inside workspace.json

### solutionFile

- (string): The name of the solution file to add the project to

- (boolean): Should the project be added to the default solution file?

### skipSwaggerLib

- (boolean): By default, if using webapi template, an additional library is scaffolded for swagger files. This skips that setup.

### pathScheme

- (string): Determines if the project should follow NX or dotnet path naming conventions
