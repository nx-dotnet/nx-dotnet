# @nx-dotnet/core:publish

## NxDotnet Publish

## Options

### configuration (string)

Defines the build configuration The default for most projects is Debug, but you can override the build configuration settings in your project.

### framework (string)

Publishes the application for the specified target framework. You must specify the target framework in the project file.

### force (boolean)

Forces all dependencies to be resolved even if the last restore was successful. Specifying this flag is the same as deleting the project.assets.json file.

### noBuild (boolean)

Doesn&#39;t build the project before publishing. It also implicitly sets the --no-restore flag.

### noDependencies (boolean)

Ignores project-to-project references and only restores the root project.

### nologo (boolean)

Doesn&#39;t display the startup banner or the copyright message. Available since .NET Core 3.0 SDK.

### noRestore (boolean)

Doesn&#39;t execute an implicit restore when running the command.

### output (string)

Specifies the path for the output directory.

### selfContained (boolean)

Publishes the .NET runtime with your application so the runtime doesn&#39;t need to be installed on the target machine. Default is true if a runtime identifier is specified and the project is an executable project (not a library project).

### runtime (string)

Publishes the application for a given runtime.

### verbosity (string)

### versionSuffix (string)

Defines the version suffix to replace the asterisk (\*) in the version field of the project file.

### publishProfile (string)

Specifies the name of the publish profile to use while publishing. Do not include the file path or the file extension. MSBuild by default looks in the Properties/PublishProfiles folder and assumes the pubxml file extension.

### extraParameters (string)

Extra command-line arguments that are passed verbatim to the dotnet command.
