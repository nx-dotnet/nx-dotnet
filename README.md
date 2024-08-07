<p style="text-align: center;">
  <image src="https://raw.githubusercontent.com/nx-dotnet/nx-dotnet/master/assets/color.svg" alt="nx-dotnet logo"/>
</p>

# NxDotnet

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->

[![All Contributors](https://img.shields.io/badge/all_contributors-15-orange.svg?style=flat-square)](#contributors-)

<!-- ALL-CONTRIBUTORS-BADGE:END -->

[![Join the chat at https://gitter.im/nx-dotnet-plugin/community](https://badges.gitter.im/nx-dotnet-plugin/community.svg)](https://gitter.im/nx-dotnet-plugin/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge) [![Run CI checks](https://github.com/nx-dotnet/nx-dotnet/actions/workflows/main.yml/badge.svg?branch=master)](https://github.com/nx-dotnet/nx-dotnet/actions/workflows/main.yml)

[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=nx-dotnet_nx-dotnet&metric=security_rating)](https://sonarcloud.io/dashboard?id=nx-dotnet_nx-dotnet) [![Bugs](https://sonarcloud.io/api/project_badges/measure?project=nx-dotnet_nx-dotnet&metric=bugs)](https://sonarcloud.io/dashboard?id=nx-dotnet_nx-dotnet) [![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=nx-dotnet_nx-dotnet&metric=code_smells)](https://sonarcloud.io/dashboard?id=nx-dotnet_nx-dotnet) [![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=nx-dotnet_nx-dotnet&metric=sqale_rating)](https://sonarcloud.io/dashboard?id=nx-dotnet_nx-dotnet) [![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=nx-dotnet_nx-dotnet&metric=ncloc)](https://sonarcloud.io/dashboard?id=nx-dotnet_nx-dotnet)

> [!NOTE]  
> Looking for @nx-dotnet/nx-ghpages or @nx-dotnet/nxdoc? They have moved. `@nx-dotnet/nx-ghpages` is now published as `nx-github-pages` and `@nx-dotnet/nxdoc` is now published as `nxdoc`. Their source code has moved to their own repos, [nx-github-pages](https://github.com/agentender/nx-github-pages) and [nxdoc](https://github.com/agententender/nxdoc).

🔎 **Nx is a set of Extensible Dev Tools for Monorepos.**

## Prerequisites

- You have an existing nx workspace (empty, or otherwise)
- You have the [@nx/js](https://www.npmjs.com/package/@nx/js) plugin added to the workspace

## Adding .NET capabilities to your workspace

Nx supports many plugins which add capabilities for developing different types of applications and different tools.

These capabilities include generating applications, libraries, etc as well as the devtools to test, and build projects as well.

Below are our plugins:

- [.NET](https://docs.microsoft.com/en-us/dotnet/)
  - `npm install --save-dev @nx-dotnet/core`

There are also many other [community plugins](https://nx.dev/community) you could add.

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

Run `nx g @nx/react:component my-component --project=my-app` to generate a new component.
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
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/agentender"><img src="https://avatars.githubusercontent.com/u/6933928?v=4?s=100" width="100px;" alt="Craigory Coppola"/><br /><sub><b>Craigory Coppola</b></sub></a><br /><a href="https://github.com/nx-dotnet/nx-dotnet/commits?author=AgentEnder" title="Code">💻</a> <a href="#design-AgentEnder" title="Design">🎨</a> <a href="#ideas-AgentEnder" title="Ideas, Planning, & Feedback">🤔</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/bcallaghan-et"><img src="https://avatars.githubusercontent.com/u/44448874?v=4?s=100" width="100px;" alt="Ben Callaghan"/><br /><sub><b>Ben Callaghan</b></sub></a><br /><a href="https://github.com/nx-dotnet/nx-dotnet/commits?author=bcallaghan-et" title="Code">💻</a> <a href="#design-bcallaghan-et" title="Design">🎨</a> <a href="#userTesting-bcallaghan-et" title="User Testing">📓</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/jordan-hall"><img src="https://avatars.githubusercontent.com/u/2092344?v=4?s=100" width="100px;" alt="Jordan Hall"/><br /><sub><b>Jordan Hall</b></sub></a><br /><a href="https://github.com/nx-dotnet/nx-dotnet/commits?author=Jordan-Hall" title="Code">💻</a> <a href="#design-Jordan-Hall" title="Design">🎨</a> <a href="#ideas-Jordan-Hall" title="Ideas, Planning, & Feedback">🤔</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://dev.to/layzee"><img src="https://avatars.githubusercontent.com/u/6364586?v=4?s=100" width="100px;" alt="Lars Gyrup Brink Nielsen"/><br /><sub><b>Lars Gyrup Brink Nielsen</b></sub></a><br /><a href="https://github.com/nx-dotnet/nx-dotnet/commits?author=LayZeeDK" title="Documentation">📖</a> <a href="#userTesting-LayZeeDK" title="User Testing">📓</a> <a href="https://github.com/nx-dotnet/nx-dotnet/issues?q=author%3ALayZeeDK" title="Bug reports">🐛</a> <a href="#blog-LayZeeDK" title="Blogposts">📝</a> <a href="#video-LayZeeDK" title="Videos">📹</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://www.linkedin.com/in/leon-chi-495a93171/"><img src="https://avatars.githubusercontent.com/u/6677963?v=4?s=100" width="100px;" alt="Leon Chi"/><br /><sub><b>Leon Chi</b></sub></a><br /><a href="https://github.com/nx-dotnet/nx-dotnet/commits?author=jimsleon" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://www.rumr.co.uk"><img src="https://avatars.githubusercontent.com/u/1983638?v=4?s=100" width="100px;" alt="Tom Davis"/><br /><sub><b>Tom Davis</b></sub></a><br /><a href="https://github.com/nx-dotnet/nx-dotnet/commits?author=photomoose" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/pemsbr"><img src="https://avatars.githubusercontent.com/u/4513618?v=4?s=100" width="100px;" alt="Pedro Rodrigues"/><br /><sub><b>Pedro Rodrigues</b></sub></a><br /><a href="https://github.com/nx-dotnet/nx-dotnet/commits?author=pemsbr" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/asinino"><img src="https://avatars.githubusercontent.com/u/32019405?v=4?s=100" width="100px;" alt="Paulo Oliveira"/><br /><sub><b>Paulo Oliveira</b></sub></a><br /><a href="https://github.com/nx-dotnet/nx-dotnet/commits?author=asinino" title="Documentation">📖</a> <a href="https://github.com/nx-dotnet/nx-dotnet/commits?author=asinino" title="Code">💻</a> <a href="https://github.com/nx-dotnet/nx-dotnet/issues?q=author%3Aasinino" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/dasco144"><img src="https://avatars.githubusercontent.com/u/10575019?v=4?s=100" width="100px;" alt="dasco144"/><br /><sub><b>dasco144</b></sub></a><br /><a href="https://github.com/nx-dotnet/nx-dotnet/commits?author=dasco144" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/tzuge"><img src="https://avatars.githubusercontent.com/u/47162374?v=4?s=100" width="100px;" alt="tzuge"/><br /><sub><b>tzuge</b></sub></a><br /><a href="https://github.com/nx-dotnet/nx-dotnet/commits?author=tzuge" title="Code">💻</a> <a href="#design-tzuge" title="Design">🎨</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://www.tinesoft.com"><img src="https://avatars.githubusercontent.com/u/4053092?v=4?s=100" width="100px;" alt="Tine Kondo"/><br /><sub><b>Tine Kondo</b></sub></a><br /><a href="https://github.com/nx-dotnet/nx-dotnet/commits?author=tinesoft" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/kellyrbourg"><img src="https://avatars.githubusercontent.com/u/75750051?v=4?s=100" width="100px;" alt="Kelly Bourg"/><br /><sub><b>Kelly Bourg</b></sub></a><br /><a href="https://github.com/nx-dotnet/nx-dotnet/commits?author=kellyrbourg" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Tungsten78"><img src="https://avatars.githubusercontent.com/u/3805338?v=4?s=100" width="100px;" alt="Christopher Leigh"/><br /><sub><b>Christopher Leigh</b></sub></a><br /><a href="https://github.com/nx-dotnet/nx-dotnet/commits?author=Tungsten78" title="Tests">⚠️</a> <a href="https://github.com/nx-dotnet/nx-dotnet/commits?author=Tungsten78" title="Code">💻</a> <a href="https://github.com/nx-dotnet/nx-dotnet/commits?author=Tungsten78" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Soulusions"><img src="https://avatars.githubusercontent.com/u/30294266?v=4?s=100" width="100px;" alt="Soulusions"/><br /><sub><b>Soulusions</b></sub></a><br /><a href="https://github.com/nx-dotnet/nx-dotnet/commits?author=Soulusions" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/EchelonFour"><img src="https://avatars.githubusercontent.com/u/1086789?v=4?s=100" width="100px;" alt="Frank Fenton"/><br /><sub><b>Frank Fenton</b></sub></a><br /><a href="https://github.com/nx-dotnet/nx-dotnet/commits?author=EchelonFour" title="Code">💻</a> <a href="https://github.com/nx-dotnet/nx-dotnet/issues?q=author%3AEchelonFour" title="Bug reports">🐛</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
