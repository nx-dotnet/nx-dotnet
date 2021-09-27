> This package is unstable! Documentation formatting could change in the future. See something that you think should be different? [Open an issue](https://github.com/nx-dotnet/nx-dotnet/issues) on github and help shape this plugin.

## Prerequisites

- Have an existing nx workspace containing an Nx plugin project. For creating this, see [nrwl's documentation](https://nx.dev/latest/angular/getting-started/nx-setup).

## Installation

### NPM

```shell
npm i --save-dev @nx-dotnet/nxdoc
```

### PNPM

```shell
pnpm i --save-dev @nx-dotnet/nxdoc
```

### Yarn

```shell
yarn add --dev @nx-dotnet/nxdoc
```

## Generate Documentation

Generate markdown docs in the /docs folder of your repository for each plugin in the workspace

```shell
npx nx g @nx-dotnet/nxdoc:generate-docs --outputPath docs
```
