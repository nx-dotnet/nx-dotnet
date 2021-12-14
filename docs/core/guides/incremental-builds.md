# Nx Incremental Builds

As of v1.8.0, `@nx-dotnet/core:build` is configured by default to pass `--no-dependencies` to the `dotnet` CLI. When working outside of Nx, this would require developers to manually build the project's dependencies. This is not the case within Nx, due to the targetDependencies setup inside `nx.json`.

When using target dependencies, Nx knows to build all dependents before building a library or application. By falling back on this logic, instead of letting `dotnet` handle building dependencies, we can better take advantage of Nx's cache and avoid duplicated builds.

## Avoiding duplicate builds during `dotnet` execution

Consider the following workspace:

- apps/webApi
- libs/classLib

If the `webApi` project depends on the `classlib` project, running the following commands without `--no-dependencies` results in the following outcomes:

- `nx build webApi`
  - Nx analyzes the dependency graph, and runs `nx build classlib`
  - Nx kicks off a child `tao` instance running the build executor for `classlib`
  - `dotnet build apps/webApi/webApi.csproj`
  - `dotnet` reads the csproj and builds classlib first
  - `dotnet` builds webApi
- `nx build classlib`
  - Nx analyzes the dependency graph, and finds no child tasks
  - `dotnet build libs/classlib/classlib.csproj`
  - `dotnet` builds classlib
- `nx affected:build`
  - Nx analyzes the dependency graph, and finds that webapi and classlib should be built.
  - Since webapi depends on classlib, Nx runs `build classlib` first.
    - `dotnet build libs/classlib/classlib.csproj`
      - `dotnet` builds classlib
  - Nx runs `build webapi`
    - `dotnet build apps/webApi/webApi.csproj`
      - `dotnet` reads the csproj and builds classlib first
      - `dotnet` builds webApi

This means that every time you build webApi or Nx affected you are waiting for 1 extra build of the classlib library. This continues to scale up and gets worse as more projects are added to the monorepo.

By punting the dependency builds to Nx, you no longer get these duplicate runs. The same scenario would look like this:

- `nx build webApi`
  - Nx analyzes the dependency graph, and runs `nx build classlib`
  - Nx kicks off a child `tao` instance running the build executor for `classlib`
  - `dotnet build apps/webApi/webApi.csproj`
  - `dotnet` builds webApi
- `nx build classlib`
  - Nx analyzes the dependency graph, and finds no child tasks
  - `dotnet build libs/classlib/classlib.csproj`
  - `dotnet` builds classlib
- `nx affected:build`
  - Nx analyzes the dependency graph, and finds that webapi and classlib should be built.
  - Since webapi depends on classlib, Nx runs `build classlib` first.
    - `dotnet build libs/classlib/classlib.csproj`
      - `dotnet` builds classlib
  - Nx runs `build webapi`
    - `dotnet build apps/webApi/webApi.csproj`
      - `dotnet` builds webApi

Note that the extra builds for classlib vanished.

## Optimizing Cache Hits

Lets use the same workspace from above, and imagine that we are working on a feature that only touched the webapi.

Running the following commands without `--no-dependencies` results in the following outcomes:

- `nx affected:build`
  - Nx analyzes the change set, and finds that only the webapi needs to be built.
  - Nx analyzes the dependency graph, and finds that only the webapi requires the classlib.
  - Since the classlib hasn't been changed, Nx pulls it down from the remote cache or restores from local if a cache is available.
  - Nx runs `build webapi`
    - `dotnet build apps/webApi/webApi.csproj`
      - `dotnet` reads the csproj and builds classlib first (_Note here, the classlib was still built from source, despite Nx restoring it from cache_)
      - `dotnet` builds webApi

With `-no-dependencies`, the same scenario looks like this:

- `nx affected:build`
  - Nx analyzes the change set, and finds that only the webapi needs to be built.
  - Nx analyzes the dependency graph, and finds that only the webapi requires the classlib.
  - Since the classlib hasn't been changed, Nx pulls it down from the remote cache or restores from local if a cache is available.
  - Nx runs `build webapi`
    - `dotnet build apps/webApi/webApi.csproj --no-dependencies`
      - `dotnet` builds webApi
