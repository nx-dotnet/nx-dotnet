---
title: '@nx-dotnet/core:publish'
---

# @nx-dotnet/core:publish

## NxDotnet Publish

Publishes an app via the `dotnet` cli command.

## Options

### configuration

- (string): Defines the build configuration The default for most projects is Debug, but you can override the build configuration settings in your project.

Default: `"Debug"`

### extraParameters

- (string): Extra command-line arguments that are passed verbatim to the dotnet command.

### force

- (boolean): Forces all dependencies to be resolved even if the last restore was successful. Specifying this flag is the same as deleting the project.assets.json file.

### framework

- (string): Publishes the application for the specified target framework. You must specify the target framework in the project file.

### noBuild

- (boolean): Doesn't build the project before publishing. It also implicitly sets the --no-restore flag.

### noDependencies

- (boolean): Ignores project-to-project references and only restores the root project.

### nologo

- (boolean): Doesn't display the startup banner or the copyright message. Available since .NET Core 3.0 SDK.

### noRestore

- (boolean): Doesn't execute an implicit restore when running the command.

### output

- (string): Specifies the path for the output directory.

### publishProfile

- (string): Specifies the name of the publish profile to use while publishing. Do not include the file path or the file extension. MSBuild by default looks in the Properties/PublishProfiles folder and assumes the pubxml file extension.

### runtime

- (string): Publishes the application for a given runtime.

### selfContained

- (boolean): Publishes the .NET runtime with your application so the runtime doesn't need to be installed on the target machine. Default is true if a runtime identifier is specified and the project is an executable project (not a library project).

### verbosity

- (string): Sets the verbosity level of the command.

Default: `"minimal"`

### versionSuffix

- (string): Defines the version suffix to replace the asterisk (\*) in the version field of the project file.
