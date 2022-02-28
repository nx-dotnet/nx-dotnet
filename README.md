
<p align="center">
  <image src="https://user-images.githubusercontent.com/6933928/135131740-66939491-dc3e-4982-82ac-e6584530bb1b.png" alt="nx-dotnet logo"/>
</p>

# NxDotnet

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-8-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

[![Join the chat at https://gitter.im/nx-dotnet-plugin/community](https://badges.gitter.im/nx-dotnet-plugin/community.svg)](https://gitter.im/nx-dotnet-plugin/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge) [![Run CI checks](https://github.com/nx-dotnet/nx-dotnet/actions/workflows/main.yml/badge.svg?branch=master)](https://github.com/nx-dotnet/nx-dotnet/actions/workflows/main.yml)

[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=nx-dotnet_nx-dotnet&metric=security_rating)](https://sonarcloud.io/dashboard?id=nx-dotnet_nx-dotnet) [![Bugs](https://sonarcloud.io/api/project_badges/measure?project=nx-dotnet_nx-dotnet&metric=bugs)](https://sonarcloud.io/dashboard?id=nx-dotnet_nx-dotnet) [![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=nx-dotnet_nx-dotnet&metric=code_smells)](https://sonarcloud.io/dashboard?id=nx-dotnet_nx-dotnet) [![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=nx-dotnet_nx-dotnet&metric=sqale_rating)](https://sonarcloud.io/dashboard?id=nx-dotnet_nx-dotnet) [![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=nx-dotnet_nx-dotnet&metric=ncloc)](https://sonarcloud.io/dashboard?id=nx-dotnet_nx-dotnet)

🔎 **Nx is a set of Extensible Dev Tools for Monorepos.**

## Prerequisites

- You have an existing nx workspace (empty, or otherwise)

## Adding .NET capabilities to your workspace

Nx supports many plugins which add capabilities for developing different types of applications and different tools.

These capabilities include generating applications, libraries, etc as well as the devtools to test, and build projects as well.

Below are our plugins:

- [.NET](https://docs.microsoft.com/en-us/dotnet/)
  - `npm install --save-dev @nx-dotnet/core`

There are also many other [community plugins](https://nx.dev/nx-community) you could add.

## Generate an application

Run `nx g @nx-dotnet/core:app my-app` to generate an application.

When using Nx, you can create multiple applications and libraries in the same workspace.

## Generate a library

Run `nx g @nx-dotnet/core:lib my-lib` to generate a library.

Libraries are shareable across libraries and applications.

## Development server

Run `nx serve my-app` for a dev server. The app will automatically reload if you change any of the source files.

<!--
## Code scaffolding

Run `nx g @nrwl/react:component my-component --project=my-app` to generate a new component.
-->

## Build

Run `nx build my-app` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Serve

Run `nx serve my-app` to run a simple development server. This will watch for file changes and rebuild your project.

## Understand your workspace

Run `nx dep-graph` to see a diagram of the dependencies of your projects.

## Contributing

Check out our [Contributors Guide](CONTRIBUTING.md)

## Further help

Visit the [Documentation](https://nx-dotnet.com/docs) to learn more.

## ☁ Nx Cloud

### Computation Memoization in the Cloud

<p align="center"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-cloud-card.png"></p>

Nx Cloud pairs with Nx in order to enable you to build and test code more rapidly, by up to 10 times. Even teams that are new to Nx can connect to Nx Cloud and start saving time instantly.

Teams using Nx gain the advantage of building full-stack applications with their preferred framework alongside Nx’s advanced code generation and project dependency graph, plus a unified experience for both frontend and backend developers.

Visit [Nx Cloud](https://nx.app/) to learn more.

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/agentender"><img src="https://avatars.githubusercontent.com/u/6933928?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Craigory Coppola</b></sub></a><br /><a href="https://github.com/nx-dotnet/nx-dotnet/commits?author=AgentEnder" title="Code">💻</a> <a href="#design-AgentEnder" title="Design">🎨</a> <a href="#ideas-AgentEnder" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/bcallaghan-et"><img src="https://avatars.githubusercontent.com/u/44448874?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Ben Callaghan</b></sub></a><br /><a href="https://github.com/nx-dotnet/nx-dotnet/commits?author=bcallaghan-et" title="Code">💻</a> <a href="#design-bcallaghan-et" title="Design">🎨</a> <a href="#userTesting-bcallaghan-et" title="User Testing">📓</a></td>
    <td align="center"><a href="https://github.com/jordan-hall"><img src="https://avatars.githubusercontent.com/u/2092344?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Jordan Hall</b></sub></a><br /><a href="https://github.com/nx-dotnet/nx-dotnet/commits?author=Jordan-Hall" title="Code">💻</a> <a href="#design-Jordan-Hall" title="Design">🎨</a> <a href="#ideas-Jordan-Hall" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://dev.to/layzee"><img src="https://avatars.githubusercontent.com/u/6364586?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Lars Gyrup Brink Nielsen</b></sub></a><br /><a href="https://github.com/nx-dotnet/nx-dotnet/commits?author=LayZeeDK" title="Documentation">📖</a> <a href="#userTesting-LayZeeDK" title="User Testing">📓</a> <a href="https://github.com/nx-dotnet/nx-dotnet/issues?q=author%3ALayZeeDK" title="Bug reports">🐛</a> <a href="#blog-LayZeeDK" title="Blogposts">📝</a> <a href="#video-LayZeeDK" title="Videos">📹</a></td>
    <td align="center"><a href="https://www.linkedin.com/in/leon-chi-495a93171/"><img src="https://avatars.githubusercontent.com/u/6677963?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Leon Chi</b></sub></a><br /><a href="https://github.com/nx-dotnet/nx-dotnet/commits?author=jimsleon" title="Code">💻</a></td>
    <td align="center"><a href="http://www.rumr.co.uk"><img src="https://avatars.githubusercontent.com/u/1983638?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Tom Davis</b></sub></a><br /><a href="https://github.com/nx-dotnet/nx-dotnet/commits?author=photomoose" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/pemsbr"><img src="https://avatars.githubusercontent.com/u/4513618?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Pedro Rodrigues</b></sub></a><br /><a href="https://github.com/nx-dotnet/nx-dotnet/commits?author=pemsbr" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/asinino"><img src="https://avatars.githubusercontent.com/u/32019405?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Paulo Oliveira</b></sub></a><br /><a href="https://github.com/nx-dotnet/nx-dotnet/commits?author=asinino" title="Documentation">📖</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
