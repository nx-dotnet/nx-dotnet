---
title: '@nx-dotnet/core:move'
---

# @nx-dotnet/core:move

## @nx-dotnet/core:move

Moves `{projectName}` to `{destination}`. Renames the Nx project to match the new folder location. Additionally, updates any .csproj, .vbproj, .fsproj, or .sln files which pointed to the project.

## Options

### <span className="required">destination</span>

- (string): Where should it be moved to?

### <span className="required">projectName</span>

- (string): Name of the project to move

### relativeToRoot

- (boolean): If true, the destination path is relative to the root rather than the workspace layout from nx.json
