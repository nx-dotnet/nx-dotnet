# [0.3.0](https://github.com/nx-dotnet/nx-dotnet/compare/v0.2.1...v0.3.0) (2021-04-28)

### Bug Fixes

* **core:** [#20](https://github.com/nx-dotnet/nx-dotnet/issues/20) test template arg cannot be passed from command line ([e9e47e0](https://github.com/nx-dotnet/nx-dotnet/commit/e9e47e01e227f458cef41c3511bba69032dcf449))
* **repo:** semantic-release not updating package.json ([9273001](https://github.com/nx-dotnet/nx-dotnet/commit/9273001d385a3e1da1ed4edcc8411641b5c2e280))


### Features

* **core:** dotnet test support [#20](https://github.com/nx-dotnet/nx-dotnet/issues/20) ([02ceed0](https://github.com/nx-dotnet/nx-dotnet/commit/02ceed0ae846d6a75de03f4fae5c4cb814ca2742))

## [0.2.1](https://github.com/nx-dotnet/nx-dotnet/compare/v0.2.0...v0.2.1) (2021-04-27)

### Bug Fixes

- **core:** include serve target only for applications ([#30](https://github.com/nx-dotnet/nx-dotnet/issues/30)) ([d3a54ce](https://github.com/nx-dotnet/nx-dotnet/commit/d3a54cefbd937f2817a676a7d0f3bd449a6f8ced)), closes [#28](https://github.com/nx-dotnet/nx-dotnet/issues/28)
- **core:** output paths still use windows separator on linux / mac ([ed1c53a](https://github.com/nx-dotnet/nx-dotnet/commit/ed1c53af9f703106dbc3abec87424ae149c14feb))
- **core:** use full project path in output directory ([7748f9c](https://github.com/nx-dotnet/nx-dotnet/commit/7748f9cf509d067bbc21867253d1d38bd2795264)), closes [#27](https://github.com/nx-dotnet/nx-dotnet/issues/27)

### Features

- **repo:** enable semantic-release ([298c5af](https://github.com/nx-dotnet/nx-dotnet/commit/298c5afd6c8bf4e09af60a83dfb5bc97a302eaf4))

# [0.3.0-dev.2](https://github.com/nx-dotnet/nx-dotnet/compare/v0.3.0-dev.1...v0.3.0-dev.2) (2021-04-27)

### Bug Fixes

- **core:** include serve target only for applications ([#30](https://github.com/nx-dotnet/nx-dotnet/issues/30)) ([9e4438e](https://github.com/nx-dotnet/nx-dotnet/commit/9e4438e2ebe591ee93fa43d33f5adf0ca50685aa)), closes [#28](https://github.com/nx-dotnet/nx-dotnet/issues/28)

# [0.3.0-dev.1](https://github.com/nx-dotnet/nx-dotnet/compare/v0.2.0...v0.3.0-dev.1) (2021-04-27)

### Bug Fixes

- **core:** misc ([7661829](https://github.com/nx-dotnet/nx-dotnet/commit/76618298474f555d4fb950fdbe69b8a2c65539f5))
- **core:** output paths still use windows separator on linux / mac ([b729fed](https://github.com/nx-dotnet/nx-dotnet/commit/b729fed5116feaeae7bcc13c35aceeed1dbfe16c))
- **core:** packages not published by last CI run ([d07b9f3](https://github.com/nx-dotnet/nx-dotnet/commit/d07b9f306677110c491da2c9a2eb075d79835c1a))
- **core:** use full project path in output directory ([d9e5988](https://github.com/nx-dotnet/nx-dotnet/commit/d9e5988e5fbc0cfac15c3b5808bcce27835cfeb3)), closes [#27](https://github.com/nx-dotnet/nx-dotnet/issues/27)
- **repo:** deployment errors ([0d92c44](https://github.com/nx-dotnet/nx-dotnet/commit/0d92c4408ecc4e49a30544b927771cd8329f6b1e))

### Features

- **ci:** fix publish script ([4c6e91a](https://github.com/nx-dotnet/nx-dotnet/commit/4c6e91ab6e9450542f7bbce5c81a5ad482a5aea1))
- **core:** fix CD ([9d5b787](https://github.com/nx-dotnet/nx-dotnet/commit/9d5b787af0537946f640820c003e70275df4bda6))
- **core:** fix deployments ([561f462](https://github.com/nx-dotnet/nx-dotnet/commit/561f462e288c3a6eae35683ff8e5e6eeae0b73f1))
- **core:** semantic-release ([799dc55](https://github.com/nx-dotnet/nx-dotnet/commit/799dc557d168dbc8fa5cf2741d99c12c1ddbaa54))
- **core:** tag nx-dotnet projects ([6442d94](https://github.com/nx-dotnet/nx-dotnet/commit/6442d94dd82e30d0b6537e97eddbcccedd799ef9))
- **core:** test sr deployment ([fbc5bbf](https://github.com/nx-dotnet/nx-dotnet/commit/fbc5bbf6665a91b44356a518452650596aad3292))
- **repo:** enable semantic-release ([12c223b](https://github.com/nx-dotnet/nx-dotnet/commit/12c223b1ee87137deee7dc9703203c4a8454c200))
- **repo:** semantic-release ([895eb22](https://github.com/nx-dotnet/nx-dotnet/commit/895eb22b15c1078687b68ec63b1d2d577a642ecd))
- **repo:** update gh actions for semantic release ([ed933e9](https://github.com/nx-dotnet/nx-dotnet/commit/ed933e977780c6680c6d99ce1a6097aaa1e1b7ea))
- **utils:** update jsdocs ([83bec44](https://github.com/nx-dotnet/nx-dotnet/commit/83bec448776d01de4c4b38b63501a3f075f1f488))

# [0.2.0](https://github.com/nx-dotnet/nx-dotnet/compare/v0.1.4...v0.2.0) (2021-04-27)

### Features

- **core:** test sr deployment ([fbc5bbf](https://github.com/nx-dotnet/nx-dotnet/commit/fbc5bbf6665a91b44356a518452650596aad3292))

# [0.2.0-dev.2](https://github.com/nx-dotnet/nx-dotnet/compare/v0.2.0-dev.1...v0.2.0-dev.2) (2021-04-26)

### Bug Fixes

- **core:** output paths still use windows separator on linux / mac ([b729fed](https://github.com/nx-dotnet/nx-dotnet/commit/b729fed5116feaeae7bcc13c35aceeed1dbfe16c))
- **core:** packages not published by last CI run ([d07b9f3](https://github.com/nx-dotnet/nx-dotnet/commit/d07b9f306677110c491da2c9a2eb075d79835c1a))

### Features

- **ci:** fix publish script ([4c6e91a](https://github.com/nx-dotnet/nx-dotnet/commit/4c6e91ab6e9450542f7bbce5c81a5ad482a5aea1))
- **core:** tag nx-dotnet projects ([6442d94](https://github.com/nx-dotnet/nx-dotnet/commit/6442d94dd82e30d0b6537e97eddbcccedd799ef9))

# [0.2.0-dev.1](https://github.com/nx-dotnet/nx-dotnet/compare/v0.1.4...v0.2.0-dev.1) (2021-04-26)

### Features

- **core:** Set output path in generated project files ([96b48f8](https://github.com/nx-dotnet/nx-dotnet/commit/96b48f80054cef14e6185d123b86f96b5f463cb9))
- **repo:** enable semantic-release ([12c223b](https://github.com/nx-dotnet/nx-dotnet/commit/12c223b1ee87137deee7dc9703203c4a8454c200))
- **repo:** Update build script to utilize Nx's capabilities regarding package.json patching. ([ee80435](https://github.com/nx-dotnet/nx-dotnet/commit/ee80435dad5226f111208c98cd83cc4e3ae66b58))
- **repo:** update gh actions for semantic release ([ed933e9](https://github.com/nx-dotnet/nx-dotnet/commit/ed933e977780c6680c6d99ce1a6097aaa1e1b7ea))
