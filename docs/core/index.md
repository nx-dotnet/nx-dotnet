---
title: '@nx-dotnet/core'
sidebar_position: 0
sidebar_label: 'Getting Started'
slug: /core/
---

# Getting Started

## Prerequisites

- Have an existing nx workspace. For creating this, see [nrwl's documentation](https://nx.dev/latest/angular/getting-started/nx-setup).
- .NET SDK is installed, and `dotnet` is available on the path. For help on this, see [Microsoft's documentation](https://dotnet.microsoft.com/learn/dotnet/hello-world-tutorial/install)

## Installation

### NPM

```shell
npm i --save-dev @nx-dotnet/core
npx nx g @nx-dotnet/core:init
```

### PNPM

```shell
pnpm i --save-dev @nx-dotnet/core
pnpx nx g @nx-dotnet/core:init
```

### Yarn

```shell
yarn add --dev @nx-dotnet/core
npx nx g @nx-dotnet/core:init
```

## Generate and run your first api!

Generate my-api, and my-api-test with C# and nunit tests.

```shell
npx nx g @nx-dotnet/core:app my-api --test-template nunit --language C#
```

Run my-api locally

```shell
npx nx serve my-api
```

## nrwl/nx/enforce-module-boundaries support

Nrwl publishes an eslint rule for enforcing module boundaries based on tags in a library. We recently added similar support to nx-dotnet.

To avoid duplicating the rules configuration, if your workspace already has it, nx-dotnet can read the dependency constraints from your workspace's eslint files. It does this by looking at what is configured for typescript files.

If your workspace does not currently contain eslint, do not worry! You do not have to install eslint just for its configuration. The same dependency constraints can be placed inside of your .nx-dotnet.rc.json file at workspace root. This should look something like below:

```json
{
  "moduleBoundaries": [
    {
      "onlyDependOnLibsWithTags": ["a", "shared"],
      "sourceTag": "a"
    },
    {
      "onlyDependOnLibsWithTags": ["b", "shared"],
      "sourceTag": "b"
    },
    {
      "onlyDependOnLibsWithTags": ["shared"],
      "sourceTag": "shared"
    }
  ],
  "nugetPackages": {}
}
```

# API Reference

## Generators

### [library](./generators/library.md)

nx-dotnet generator

### [application](./generators/application.md)

Generate a new C# project.

### [project-reference](./generators/project-reference.md)

Adds a reference from one project to another.

### [init](./generators/init.md)

init generator

### [sync](./generators/sync.md)

sync generator

### [nuget-reference](./generators/nuget-reference.md)

nuget-reference generator

### [restore](./generators/restore.md)

Restores NuGet packages and .NET tools used by the workspace

### [test](./generators/test.md)

Generate a .NET test project for an existing application or library

### [import-projects](./generators/import-projects.md)

Import existing projects into your nx workspace

### [add-swagger-target](./generators/add-swagger-target.md)

Generate a target to extract the swagger.json file from a .NET webapi

## Executors

### [build](./executors/build.md)

build executor

### [serve](./executors/serve.md)

serve executor

### [test](./executors/test.md)

test executor

### [publish](./executors/publish.md)

publish executor

### [format](./executors/format.md)

Formats and lints a project using the dotnet-format tool

### [update-swagger](./executors/update-swagger.md)

Generates a swagger document for an API project
