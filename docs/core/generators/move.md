# @nx-dotnet/core:move

## @nx-dotnet/core:move

Moves {projectName} to {destination}. Renames the Nx and .NET project to match the destination. Additionally, updates all code references to the moved project.

## Options

### <span className="required">projectName</span>

- (string): Name of the project to move

### <span className="required">destination</span>

- (string): Where should it be moved to?

### relativeToRoot

- (boolean): If true, the destination path is relative to the root rather than the workspace layout from nx.json
