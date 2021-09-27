# @nx-dotnet/core:nuget-reference

## Nuget Reference

Add a nuget reference to a .NET project

## Options

### <span className="required">project</span>

- (string): The project to which the reference is added.

### <span className="required">packageName</span>

- (string): Which package should be added?

### version

- (string): The package version to add.

### framework

- (string): Adds a package reference only when targeting a specific framework.

### packageDirectory

- (string): The directory where to restore the packages. The default package restore location is %userprofile%\.nuget\packages on Windows and ~/.nuget/packages on macOS and Linux. For more information, see [Managing the global packages, cache, and temp folders in NuGet](https://docs.microsoft.com/en-us/nuget/consume-packages/managing-the-global-packages-and-cache-folders).

### prerelease

- (boolean): Allows prerelease packages to be installed. Available since .NET Core 5 SDK

### source

- (string): The URI of the NuGet package source to use during the restore operation.

### noRestore

- (boolean): Adds a package reference without performing a restore preview and compatibility check.

### allowVersionMismatch

- (boolean): Ignores single version principle for this package across all apps in the workspace
