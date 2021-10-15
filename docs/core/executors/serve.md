# @nx-dotnet/core:serve

## NxDotnet Serve Executor

Uses `dotnet run` and chokidar to run a .NET app.

## Options

### configuration

- (string): Defines the build configuration. The default for most projects is Debug, but you can override the build configuration settings in your project.

### framework

- (string): Builds and runs the app using the specified framework. The framework must be specified in the project file.

### force

- (boolean): Forces all dependencies to be resolved even if the last restore was successful. Specifying this flag is the same as deleting the project.assets.json file.

### launch-profile

- (string): The name of the launch profile (if any) to use when launching the application. Launch profiles are defined in the launchSettings.json file and are typically called Development, Staging, and Production. For more information, see Working with multiple environments.

### no-launch-profile

- (boolean): Doesn&#39;t try to use launchSettings.json to configure the application.

### runtime

- (string): Specifies the target runtime to restore packages for. For a list of Runtime Identifiers (RIDs), see the RID catalog. -r short option available since .NET Core 3.0 SDK.

### verbosity

- (string): Sets the verbosity level of the command. Allowed values are q[uiet], m[inimal], n[ormal], d[etailed], and diag[nostic]. The default value is m. Available since .NET Core 2.1 SDK.

### watch

- (boolean): Determines if the serve should watch files or just run the built packages
