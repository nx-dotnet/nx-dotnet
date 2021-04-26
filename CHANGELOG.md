# NxDotnet

[![Join the chat at https://gitter.im/nx-dotnet-plugin/community](https://badges.gitter.im/nx-dotnet-plugin/community.svg)](https://gitter.im/nx-dotnet-plugin/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge) [![Run CI checks](https://github.com/nx-dotnet/nx-dotnet/actions/workflows/main.yml/badge.svg?branch=master)](https://github.com/nx-dotnet/nx-dotnet/actions/workflows/main.yml)

[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=nx-dotnet_nx-dotnet&metric=security_rating)](https://sonarcloud.io/dashboard?id=nx-dotnet_nx-dotnet) [![Bugs](https://sonarcloud.io/api/project_badges/measure?project=nx-dotnet_nx-dotnet&metric=bugs)](https://sonarcloud.io/dashboard?id=nx-dotnet_nx-dotnet) [![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=nx-dotnet_nx-dotnet&metric=code_smells)](https://sonarcloud.io/dashboard?id=nx-dotnet_nx-dotnet) [![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=nx-dotnet_nx-dotnet&metric=sqale_rating)](https://sonarcloud.io/dashboard?id=nx-dotnet_nx-dotnet) [![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=nx-dotnet_nx-dotnet&metric=ncloc)](https://sonarcloud.io/dashboard?id=nx-dotnet_nx-dotnet)

This project was generated using [Nx](https://nx.dev).

<p align="center">
  <img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="450"><img src="https://upload.wikimedia.org/wikipedia/commons/a/a3/.NET_Logo.svg" width="450">
</p>

🔎 **Nx is a set of Extensible Dev Tools for Monorepos.**

## Adding capabilities to your workspace

Nx supports many plugins which add capabilities for developing different types of applications and different tools.

These capabilities include generating applications, libraries, etc as well as the devtools to test, and build projects as well.

Below are our plugins:

- [.NET](https://docs.microsoft.com/en-us/dotnet/)
  - `npm install --save-dev @nx-dotnet/core`

There are also many [community plugins](https://nx.dev/nx-community) you could add.

## Generate an application

Run `nx g @nx-dotnet/core:app my-app` to generate an application.

> You can use any of the plugins above to generate applications as well.

When using Nx, you can create multiple applications and libraries in the same workspace.

## Generate a library

Run `nx g @nx-dotnet/core:lib my-lib` to generate a library.

> You can also use any of the plugins above to generate libraries as well.

Libraries are shareable across libraries and applications.

<!--
## Development server

Run `nx serve my-app` for a dev server. Navigate to http://localhost:4200/. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `nx g @nrwl/react:component my-component --project=my-app` to generate a new component.
-->

## Build

Run `nx build my-app` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

<!--
## Running unit tests

Run `nx test my-app` to execute the unit tests via [Jest](https://jestjs.io).

Run `nx affected:test` to execute the unit tests affected by a change.

## Running end-to-end tests

Run `ng e2e my-app` to execute the end-to-end tests via [Cypress](https://www.cypress.io).

Run `nx affected:e2e` to execute the end-to-end tests affected by a change.-->

## Understand your workspace

Run `nx dep-graph` to see a diagram of the dependencies of your projects.

## Further help

Visit the [Nx Documentation](https://nx.dev) to learn more.

## ☁ Nx Cloud

### Computation Memoization in the Cloud

<p align="center"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-cloud-card.png"></p>

Nx Cloud pairs with Nx in order to enable you to build and test code more rapidly, by up to 10 times. Even teams that are new to Nx can connect to Nx Cloud and start saving time instantly.

Teams using Nx gain the advantage of building full-stack applications with their preferred framework alongside Nx’s advanced code generation and project dependency graph, plus a unified experience for both frontend and backend developers.

Visit [Nx Cloud](https://nx.app/) to learn more.
