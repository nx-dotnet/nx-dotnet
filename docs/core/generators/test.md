# @nx-dotnet/core:test

## NxDotnet Test Generator

Generate a .NET test project for an existing application or library

## Options

### <span className="required">name</span>

- (string): The existing project to generate tests for

### <span className="required">testTemplate</span>

- (string): Which template should be used for creating the tests project?

### language

- (string): Which language should the project use?

### suffix

- (string): What suffix should be used for the tests project name?

### skipOutputPathManipulation

- (boolean): Skip XML changes for default build path

### standalone

- (boolean): Should the project use project.json? If false, the project config is inside workspace.json
