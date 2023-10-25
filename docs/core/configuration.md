# Configuration

`@nx-dotnet/core` can be configured to update the project graph in various ways depending on your needs. Prior to Nx 17, this configuration was stored inside of a bespoke `.nx-dotnet.rc.json` file. As part of the updates made for Nx 17, this configuration is now stored inside of the plugins array inside `nx.json`. More details on the generic formatting of this configuration can be found in the [Nx documentation](https://nx.dev/reference/nx-json#plugins).

## Available Options

The most up to date list of options can be found embedded in @nx-dotnet/core's source code on [GitHub](https://github.com/nx-dotnet/nx-dotnet/blob/master/packages/utils/src/lib/models/nx-dotnet-config.interface.ts).

### `nugetPackages`

A key value map representing installed nuget packages in the workspace. Used by [`@nx-dotnet/core:nuget-reference`](./Generators/nuget-reference.md) to determine what version to install by default, and kept up to date by [`@nx-dotnet/core:sync`](./Generators/sync.md).

### `moduleBoundaries`

Provides an alternative way to define module boundaries for workspaces which do not include an eslint configuration file. `@nx-dotnet/core` adds a prebuild task by default to run module boundaries checks as described in the [nx documentation](https://nx.dev/recipes/enforce-module-boundaries), but the default configuration method of using .eslintrc.json doesn't make sense for C# only workspaces.

The `moduleBoundaries` configuration can be referenced on [Github](https://github.com/nx-dotnet/nx-dotnet/blob/master/packages/utils/src/lib/models/nx.ts).

### `solutionFile`

Describes a default solution file that projects should be added to on generation. This is described in more detail in the [solutions guide](./guides/handling-solutions.md).

### `inferProjects`

A boolean value which determines whether or not `@nx-dotnet/core` should attempt to infer projects from the workspace. If false, `@nx-dotnet/core` will not register any new projects or targets to the workspace. It will only add dependencies to existing projects.

If true, `@nx-dotnet/core` will attempt to infer projects from `.csproj`, `.fsproj`, or `.vbproj` files in the workspace.

### `inferredTargets`

Can be set to either `false` or a key value map describing how to infer targets from projects. If `false`, `@nx-dotnet/core` will not attempt to infer targets from projects. If a key value map, `@nx-dotnet/core` will attempt to infer targets from projects based on the provided configuration.

`@nx-dotnet/core` can infer the following targets:

- build
- test
- lint
- serve

The test target will only be added to the project if the project file mentions "Microsoft.NET.Test.Sdk".

As an example the following configuration will result in the `test` target being named "mstest" and the `serve` target not being added to the project. The `build` and `lint` targets will be added to the project with their default names.

```json
{
  "plugins": [
    {
      "plugin": "@nx-dotnet/core",
      "options": {
        "inferredTargets": {
          "test": "mstest",
          "serve": false
        }
      }
    }
  ]
}
```

### `ignorePaths`

An array of paths to ignore projects within. This is useful for workspaces which contain projects that are not .NET projects, or for workspaces which contain projects that are not intended to be built by Nx.

### `tags`

Defaults to ['nx-dotnet']. Can be used to add tags to all projects with information inferred by `@nx-dotnet/core`.

## Deprecated Options

:::danger

Properties below this line are from previous versions and support for them may vary. They will be removed in a future release, and should be updated to use configuration options described above.

:::

### `inferProjectTargets`

A boolean value which determines whether or not `@nx-dotnet/core` should attempt to infer targets from projects. If false, `@nx-dotnet/core` will not register any new targets to the workspace. It will only add dependencies to existing targets.

Existing usages should be updated to use the [`inferredTargets`](#inferredtargets) configuration option.
