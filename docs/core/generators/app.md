# @nx-dotnet/core:app

## NxDotnet Application Generator

Generate a dotnet project under the application directory.

## Options

### <span className="required">name</span>

- (string): The name assigned to the app

### tags

- (string): Add tags to the project (used for linting)

### directory

- (string): A directory where the project is placed

### <span className="required">template</span>

- (string): The template to instantiate when the command is invoked. Each template might have specific options you can pass.

### <span className="required">language</span>

- (string): Which language should the project use?

### testTemplate

- (string): Which template should be used for creating the tests project?

### skipOutputPathManipulation

- (boolean): Skip XML changes for default build path
