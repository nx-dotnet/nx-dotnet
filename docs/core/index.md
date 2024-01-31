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

### [library](./Generators/library.md)

Generate a new C# project as an Nx library

### [application](./Generators/application.md)

Generate a new C# project as an Nx application

### [project-reference](./Generators/project-reference.md)

Add a reference from one project to another

### [sync](./Generators/sync.md)

Synchronizes NuGet references for the workspace

### [nuget-reference](./Generators/nuget-reference.md)

Add a NuGet reference to a project

### [restore](./Generators/restore.md)

Restores NuGet packages and .NET tools used by the workspace

### [test](./Generators/test.md)

Generate a .NET test project for an existing application or library

### [add-swagger-target](./Generators/add-swagger-target.md)

Add a swagger target to a webapi based project to extract swagger.json into a newly generated library project

### [swagger-typescript](./Generators/swagger-typescript.md)

Generate a typescript library project based on an openapi/swagger specification file

### [move](./Generators/move.md)

Moves a .NET project (including updating references)

## Executors

### [build](./Executors/build.md)

Invokes `dotnet build` to build a project with .NET Core CLI

### [serve](./Executors/serve.md)

Invokes `dotnet watch` in combination with `dotnet build` to run a dev-server

### [test](./Executors/test.md)

Invokes `dotnet test` to execute unit tests via .NET Core CLI

### [publish](./Executors/publish.md)

Invokes `dotnet publish`

### [format](./Executors/format.md)

Formats and lints a project using the dotnet-format tool

### [update-swagger](./Executors/update-swagger.md)

Generates a swagger document for an API project

### [openapi-codegen](./Executors/openapi-codegen.md)

Invokes `nx g @nx-dotnet/core:swagger-typescript` with the proper parameters to update a codegen based library
