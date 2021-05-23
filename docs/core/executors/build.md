# @nx-dotnet/core:build

## NxDotnet Build

Builds an app via the `dotnet` cli command.

## Options

### framework

- (string): Compiles for a specific framework. The framework must be defined in the project file

### version-suffix

- (number): Sets the value of the $(VersionSuffix) property to use when building the project. This only works if the $(Version) property isn&#39;t set. Then, $(Version) is set to the $(VersionPrefix) combined with the $(VersionSuffix), separated by a dash.

### configuration <span style={{color:"red"}}>\*</span>

- (string): Defines the build configuration. The default for most projects is Debug, but you can override the build configuration settings in your project

### force

- (boolean): Forces all dependencies to be resolved even if the last restore was successful. Specifying this flag is the same as deleting the project.assets.json file.

### no-dependencies

- (boolean): Ignores project-to-project (P2P) references and only builds the specified root project.

### no-incremental

- (boolean): Marks the build as unsafe for incremental build. This flag turns off incremental compilation and forces a clean rebuild of the project&#39;s dependency graph.

### no-restore

- (boolean): Doesn&#39;t execute an implicit restore during build.

### nologo

- (boolean): Doesn&#39;t display the startup banner or the copyright message. Available since .NET Core 3.0 SDK.

### output

- (string): Directory in which to place the built binaries. If not specified, the default path is ./bin/&lt;configuration&gt;/&lt;framework&gt;/. For projects with multiple target frameworks (via the TargetFrameworks property), you also need to define --framework when you specify this option.

### verbosity

- (string):
