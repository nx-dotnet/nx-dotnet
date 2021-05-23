# @nx-dotnet/core:app

## NxDotnet Application Generator

Generate a dotnet project under the application directory.

## Options

### name <span style={{color:"red"}}>\*</span>

- (string):

### tags

- (string): Add tags to the project (used for linting)

### directory

- (string): A directory where the project is placed

### template <span style={{color:"red"}}>\*</span>

- (string): The template to instantiate when the command is invoked. Each template might have specific options you can pass.

### language <span style={{color:"red"}}>\*</span>

- (string): Which language should the project use?

### testTemplate

- (string): Which template should be used for creating the tests project?

### skipOutputPathManipulation

- (boolean): Skip XML changes for default build path
