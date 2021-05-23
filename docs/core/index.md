---
title: '@nx-dotnet/core'
sidebar_position: 0
slug: /core/
---

# Getting Started

## Prerequisites

- Have an existing nx workspace. For creating this, see [nrwl&#39;s documentation](https://nx.dev/latest/angular/getting-started/nx-setup).
- .NET SDK is installed, and `dotnet` is available on the path. For help on this, see [Microsoft&#39;s documentation](https://dotnet.microsoft.com/learn/dotnet/hello-world-tutorial/install)

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

# API Reference

## Generators

### [lib](./generators/lib.md)

nx-dotnet generator

### [app](./generators/app.md)

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
