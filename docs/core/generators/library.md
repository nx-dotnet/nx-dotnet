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

### <span className="required">template</span>

- (string): The template to instantiate when the command is invoked. Each template might have specific options you can pass.

### <span className="required">language</span>

- (string): Which language should the project use?

### <span className="required">testTemplate</span>

- (string): Which template should be used for creating the tests project?

### standalone

- (boolean): Should the project use project.json? If false, the project config is inside workspace.json

### solutionFile

- (string): The name of the solution file to add the project to

- (boolean): Should the project be added to the default solution file?
