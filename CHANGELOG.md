## [1.4.1](https://github.com/nx-dotnet/nx-dotnet/compare/v1.4.0...v1.4.1) (2021-09-15)

### Bug Fixes

- **core:** npm prepare script may be removed ([b8e88fa](https://github.com/nx-dotnet/nx-dotnet/commit/b8e88fa317c7b23f0cebaf301410dce708991fb7)), closes [#101](https://github.com/nx-dotnet/nx-dotnet/issues/101)
- **core:** publish output config should be relative to workspace root ([30a7a26](https://github.com/nx-dotnet/nx-dotnet/commit/30a7a265d508df1dd50818dbd02d94b4ed871c6d)), closes [#100](https://github.com/nx-dotnet/nx-dotnet/issues/100)

# [1.4.0](https://github.com/nx-dotnet/nx-dotnet/compare/v1.3.2...v1.4.0) (2021-09-10)

### Features

- **core:** ability to import projects into the nx configuration ([8be8446](https://github.com/nx-dotnet/nx-dotnet/commit/8be8446f27791c95c040a43003fa45d96e6d080f))

## [1.3.2](https://github.com/nx-dotnet/nx-dotnet/compare/v1.3.1...v1.3.2) (2021-08-26)

### Bug Fixes

- **core:** serve + test --watch executor should not exit immediately ([8484202](https://github.com/nx-dotnet/nx-dotnet/commit/848420231d0a094bd05918124a85e1440577efd3)), closes [#96](https://github.com/nx-dotnet/nx-dotnet/issues/96)

## [1.3.1](https://github.com/nx-dotnet/nx-dotnet/compare/v1.3.0...v1.3.1) (2021-08-24)

### Bug Fixes

- use test project name in msbuild task ([cc29ea9](https://github.com/nx-dotnet/nx-dotnet/commit/cc29ea9a4b3b4b76a928b051e5badcf17cf2a2a4))

# [1.3.0](https://github.com/nx-dotnet/nx-dotnet/compare/v1.2.0...v1.3.0) (2021-08-23)

### Bug Fixes

- display project tag instead of [object Object] ([2dea7fc](https://github.com/nx-dotnet/nx-dotnet/commit/2dea7fcada490888dae1a3984ca00db1e7dc95d2))
- **core:** use fully qualified project name in msbuild task ([2c54310](https://github.com/nx-dotnet/nx-dotnet/commit/2c543102d47f42638cbb20597c965cde85527b7f))

### Features

- **core:** pickup `global.json` overrides at the project level ([49ce6bc](https://github.com/nx-dotnet/nx-dotnet/commit/49ce6bc5727a9c9789b701784363f582f0ee09ab)), closes [#87](https://github.com/nx-dotnet/nx-dotnet/issues/87) [#86](https://github.com/nx-dotnet/nx-dotnet/issues/86)

# [1.2.0](https://github.com/nx-dotnet/nx-dotnet/compare/v1.1.4...v1.2.0) (2021-08-20)

### Features

- **core:** [#81](https://github.com/nx-dotnet/nx-dotnet/issues/81) support for nx-enforce-module-boundaries ([3fc92fd](https://github.com/nx-dotnet/nx-dotnet/commit/3fc92fdfb99e9c2dd01a0b05e4fd1b1bca2b2437))
- **core:** ability to load module boundaries from nx-dotnet config ([2618b5d](https://github.com/nx-dotnet/nx-dotnet/commit/2618b5d5722035f3b20916ea4baf92d04e417ede))

## [1.1.4](https://github.com/nx-dotnet/nx-dotnet/compare/v1.1.3...v1.1.4) (2021-08-13)

### Bug Fixes

- update missing sections of misc. package.json files ([dbcf9bd](https://github.com/nx-dotnet/nx-dotnet/commit/dbcf9bdac038d9701322635e0e6e06013d66499e))

## [1.1.3](https://github.com/nx-dotnet/nx-dotnet/compare/v1.1.2...v1.1.3) (2021-08-11)

### Bug Fixes

- **docs-site:** prepush hook for docs changes ([cfc92c1](https://github.com/nx-dotnet/nx-dotnet/commit/cfc92c1e065cf5b9555a759c5933e99fc674f574))

## [1.1.2](https://github.com/nx-dotnet/nx-dotnet/compare/v1.1.1...v1.1.2) (2021-08-11)

### Bug Fixes

- **docs-site:** docs changes should be committed back to repo ([10e2936](https://github.com/nx-dotnet/nx-dotnet/commit/10e2936193092b7d35820bb967e9a220dc8843f9))

## [1.1.1](https://github.com/nx-dotnet/nx-dotnet/compare/v1.1.0...v1.1.1) (2021-08-11)

### Bug Fixes

- **docs-site:** docs changes should be committed back into repo ([d773152](https://github.com/nx-dotnet/nx-dotnet/commit/d7731524ab9169c791fe28d18874d100b1e57904))

# [1.1.0](https://github.com/nx-dotnet/nx-dotnet/compare/v1.0.2...v1.1.0) (2021-08-10)

### Features

- **core:** added support for test project name suffix ([#78](https://github.com/nx-dotnet/nx-dotnet/issues/78)) ([9f8f03c](https://github.com/nx-dotnet/nx-dotnet/commit/9f8f03cfb36c1a9becaafc602531baec9f51e0f0)), closes [#77](https://github.com/nx-dotnet/nx-dotnet/issues/77)

## [1.0.2](https://github.com/nx-dotnet/nx-dotnet/compare/v1.0.1...v1.0.2) (2021-08-04)

### Bug Fixes

- **core:** test project generator should add project reference correctly ([b5bc27d](https://github.com/nx-dotnet/nx-dotnet/commit/b5bc27dffef7ce1f6a671e0149ca6e41281fb91b))

## [1.0.1](https://github.com/nx-dotnet/nx-dotnet/compare/v1.0.0...v1.0.1) (2021-08-04)

### Bug Fixes

- **core:** dep-graph affected should work ([#76](https://github.com/nx-dotnet/nx-dotnet/issues/76)) ([2e56afc](https://github.com/nx-dotnet/nx-dotnet/commit/2e56afc9b46e11ad1fb1ef5ea7767e1923fac0a0))

# [1.0.0](https://github.com/nx-dotnet/nx-dotnet/compare/v0.15.0...v1.0.0) (2021-07-30)

### Bug Fixes

- compatibility with nx 12.6+ ([d393b3a](https://github.com/nx-dotnet/nx-dotnet/commit/d393b3a241b73bb65c904b18fb98b1dd9d657241))

### BREAKING CHANGES

- Minimum Nx version is 12.6, if using the dep-graph plugin.

Co-authored-by: Leon Chi <leon.chi@serko.com>
Co-authored-by: Craigory Coppola <craigorycoppola@gmail.com>

# [0.15.0](https://github.com/nx-dotnet/nx-dotnet/compare/v0.14.0...v0.15.0) (2021-07-12)

### Features

- **core:** Add generator option for standalone projects ([#71](https://github.com/nx-dotnet/nx-dotnet/issues/71)) ([8db11d4](https://github.com/nx-dotnet/nx-dotnet/commit/8db11d4f9fa799a90e6e27de1cc9cc6eec87451c))

# [0.14.0](https://github.com/nx-dotnet/nx-dotnet/compare/v0.13.0...v0.14.0) (2021-07-05)

### Features

- **core:** add test project generator ([#69](https://github.com/nx-dotnet/nx-dotnet/issues/69)) ([7f7084f](https://github.com/nx-dotnet/nx-dotnet/commit/7f7084f1c4809acf9278a8dafbf255ba34c5ab0b))

# [0.13.0](https://github.com/nx-dotnet/nx-dotnet/compare/v0.12.0...v0.13.0) (2021-06-23)

### Features

- **nxdoc:** support for docusaurus@2.0.0-beta.1 ([3be3d48](https://github.com/nx-dotnet/nx-dotnet/commit/3be3d4803aec74178433296667f70e68aa7a9646))

# [0.12.0](https://github.com/nx-dotnet/nx-dotnet/compare/v0.11.0...v0.12.0) (2021-06-21)

### Bug Fixes

- **nx-ghpages:** deploy executor should work ([7d29f24](https://github.com/nx-dotnet/nx-dotnet/commit/7d29f246dd887b710acd4e1a1929be127e88b257))

### Features

- **nx-ghpages:** initial work ([621627d](https://github.com/nx-dotnet/nx-dotnet/commit/621627df1c34a5520bb0d7dcaaa178368c54ecec))

# [0.11.0](https://github.com/nx-dotnet/nx-dotnet/compare/v0.10.3...v0.11.0) (2021-05-27)

### Bug Fixes

- **core:** Remove extra separator from project names ([#61](https://github.com/nx-dotnet/nx-dotnet/issues/61)) ([049367c](https://github.com/nx-dotnet/nx-dotnet/commit/049367cd38a40b41d296d2eaab7d19ca61c93c69)), closes [#60](https://github.com/nx-dotnet/nx-dotnet/issues/60)

### Features

- **docs-site:** support for docsearch ([#62](https://github.com/nx-dotnet/nx-dotnet/issues/62)) [skip ci] ([6d09f31](https://github.com/nx-dotnet/nx-dotnet/commit/6d09f31de4cb97881325fc4978589adcde3280bf))

## [0.10.3](https://github.com/nx-dotnet/nx-dotnet/compare/v0.10.2...v0.10.3) (2021-05-24)

### Bug Fixes

- **nxdoc:** nxdocs fails to run if any file does not have getting started text ([f6b800f](https://github.com/nx-dotnet/nx-dotnet/commit/f6b800fb05b8231570a32b63d22d149ccf632cfc))
- **nxdoc:** template for oneOf includes extra bullet point ([ce0687d](https://github.com/nx-dotnet/nx-dotnet/commit/ce0687d1ee7bc0a59f29fc8f280cf64ba354912a))

## [0.10.2](https://github.com/nx-dotnet/nx-dotnet/compare/v0.10.1...v0.10.2) (2021-05-24)

### Bug Fixes

- **nxdoc:** anyOf is not officially supported by nx, but oneOf is ([70f484f](https://github.com/nx-dotnet/nx-dotnet/commit/70f484f31720979a8233aeb34162f48515bc2e5e))

## [0.10.1](https://github.com/nx-dotnet/nx-dotnet/compare/v0.10.0...v0.10.1) (2021-05-24)

### Bug Fixes

- **docs-site:** correct docusaurus config ([c479567](https://github.com/nx-dotnet/nx-dotnet/commit/c47956766c354381a857cb29edc7c618d0d1fa2e))

# [0.10.0](https://github.com/nx-dotnet/nx-dotnet/compare/v0.9.1...v0.10.0) (2021-05-23)

### Bug Fixes

- **docs-site:** invalid baseUrl with custom domain ([5cf6c70](https://github.com/nx-dotnet/nx-dotnet/commit/5cf6c70fc57a0e4a2af1542419a12e969f62ffb7))
- **nxdoc:** include generator / executor description in detail file ([b0bf601](https://github.com/nx-dotnet/nx-dotnet/commit/b0bf6015ee25555d23f839237d0edb241257c55c))

### Features

- **nx-docs:** support for oneOf in schema.json files ([7ab15c6](https://github.com/nx-dotnet/nx-dotnet/commit/7ab15c61122605204047758ca565f4760498f255))
- **nxdoc:** include getting started text ([db3ec62](https://github.com/nx-dotnet/nx-dotnet/commit/db3ec625d5998d96aed82edbbd2c2d017a7ea3be))
- **nxdoc:** mark required properties ([8b8b01c](https://github.com/nx-dotnet/nx-dotnet/commit/8b8b01c87d8446ac7ec42b029825fb76463e7523))

## [0.9.2](https://github.com/nx-dotnet/nx-dotnet/compare/v0.9.1...v0.9.2) (2021-05-23)

### Bug Fixes

- **docs-site:** invalid baseUrl with custom domain ([5cf6c70](https://github.com/nx-dotnet/nx-dotnet/commit/5cf6c70fc57a0e4a2af1542419a12e969f62ffb7))

## [0.9.1](https://github.com/nx-dotnet/nx-dotnet/compare/v0.9.0...v0.9.1) (2021-05-23)

### Bug Fixes

- **docs-site:** deploy on commit to master ([e259a28](https://github.com/nx-dotnet/nx-dotnet/commit/e259a28c5df552a3c85fa7b154c47fe2fc19ed61))

# [0.9.0](https://github.com/nx-dotnet/nx-dotnet/compare/v0.8.2...v0.9.0) (2021-05-23)

### Features

- **docs-site:** setup docusaurus site ([#57](https://github.com/nx-dotnet/nx-dotnet/issues/57)) ([a268c70](https://github.com/nx-dotnet/nx-dotnet/commit/a268c7090c9ea5ad669ad9f080a42a6c42fec704)), closes [#53](https://github.com/nx-dotnet/nx-dotnet/issues/53)

## [0.8.2](https://github.com/nx-dotnet/nx-dotnet/compare/v0.8.1...v0.8.2) (2021-05-21)

### Bug Fixes

- **nxdoc:** generators do not appear in index if no executors are present ([c019467](https://github.com/nx-dotnet/nx-dotnet/commit/c019467a6ed4dad72da26c52e208e1be374a7d7d))

## [0.8.1](https://github.com/nx-dotnet/nx-dotnet/compare/v0.8.0...v0.8.1) (2021-05-21)

### Bug Fixes

- **nxdoc:** invalid generators.json ([b3b03be](https://github.com/nx-dotnet/nx-dotnet/commit/b3b03be0134df68e603ee1cf6a3401662f67b6cb))

# [0.8.0](https://github.com/nx-dotnet/nx-dotnet/compare/v0.7.1...v0.8.0) (2021-05-21)

### Features

- **nxdoc:** scaffold plugin + generate-docs v1 ([80b0368](https://github.com/nx-dotnet/nx-dotnet/commit/80b03681908fa6ba374d935af463f9f79aeca3a9))
- **repo:** docs generator prints options ([bddc5b5](https://github.com/nx-dotnet/nx-dotnet/commit/bddc5b58e2946c83a1c452ea8e68b6abf0a6608a))
- **repo:** schematic to generate docs [#53](https://github.com/nx-dotnet/nx-dotnet/issues/53) ([a7828c5](https://github.com/nx-dotnet/nx-dotnet/commit/a7828c5eddc238d85e6bf56590d47c9cc71b4d5a))

## [0.7.1](https://github.com/nx-dotnet/nx-dotnet/compare/v0.7.0...v0.7.1) (2021-05-20)

### Bug Fixes

- **core:** format files after successful migration ([c92814a](https://github.com/nx-dotnet/nx-dotnet/commit/c92814a9b906b2370a4ffd90a4fe3282c61828e8))
- **core:** rename migrations key to nx-migrations ([c6993b9](https://github.com/nx-dotnet/nx-dotnet/commit/c6993b96207b06e7d0ec8a6b252d19a5670ed0fd))
- **repo:** e2e tests run in CI again ([f7ed139](https://github.com/nx-dotnet/nx-dotnet/commit/f7ed139d499673848ddde0f4b8936f7652f9eaec))

# [0.7.0](https://github.com/nx-dotnet/nx-dotnet/compare/v0.6.2...v0.7.0) (2021-05-20)

### Features

- **core:** add lint config to generated projects ([d320ce8](https://github.com/nx-dotnet/nx-dotnet/commit/d320ce8579d62b2953d8646ae2bf4eec11018820))
- **core:** add migration to add lint target ([e391744](https://github.com/nx-dotnet/nx-dotnet/commit/e391744c3cd261c6dc462a68335dfd602b928b58))
- **core:** add new executor for dotnet-format ([92afd05](https://github.com/nx-dotnet/nx-dotnet/commit/92afd051527cf00cbbfe20c9a1d9b1e6e5bd6140)), closes [#13](https://github.com/nx-dotnet/nx-dotnet/issues/13)

## [0.6.2](https://github.com/nx-dotnet/nx-dotnet/compare/v0.6.1...v0.6.2) (2021-05-19)

### Bug Fixes

- **utils:** getDependantProjectsForNxProject should work on Unix ([96cbc33](https://github.com/nx-dotnet/nx-dotnet/commit/96cbc33ec6b5e9d0492fba4902ee76938230b146)), closes [#43](https://github.com/nx-dotnet/nx-dotnet/issues/43)

## [0.6.1](https://github.com/nx-dotnet/nx-dotnet/compare/v0.6.0...v0.6.1) (2021-05-19)

### Bug Fixes

- **core:** add unused options parameter for restore ([c8b0334](https://github.com/nx-dotnet/nx-dotnet/commit/c8b033403b1ba7d1365526dc5306338912adcf4c))

# [0.6.0](https://github.com/nx-dotnet/nx-dotnet/compare/v0.5.2...v0.6.0) (2021-05-19)

### Bug Fixes

- **core:** add unused options parameter ([c434d32](https://github.com/nx-dotnet/nx-dotnet/commit/c434d32bc4d145bbf5fe417fa9fe5fabed25fc31))
- **core:** pass client through to init schematic ([5908947](https://github.com/nx-dotnet/nx-dotnet/commit/59089474f4d4c2378715a07d5629f802b0513cee))

### Features

- **core:** add a generator for dotnet restore ([96082a1](https://github.com/nx-dotnet/nx-dotnet/commit/96082a1ae582acb8d0fe3bb9ab45adcd112ce398))
- **core:** add restore to prepare script during init ([c2b1c23](https://github.com/nx-dotnet/nx-dotnet/commit/c2b1c236d6a556f920f0d96f1197daaf92c6c35f)), closes [#44](https://github.com/nx-dotnet/nx-dotnet/issues/44)
- **core:** create tool manifest during init ([996aaee](https://github.com/nx-dotnet/nx-dotnet/commit/996aaee4d76beeb3068edb60a6dde3daebe53a55)), closes [#44](https://github.com/nx-dotnet/nx-dotnet/issues/44)
- **dotnet:** add a method to install local tools ([6ab5d4a](https://github.com/nx-dotnet/nx-dotnet/commit/6ab5d4ae115f9c8419c14c2bb86879dd3f72764e)), closes [#44](https://github.com/nx-dotnet/nx-dotnet/issues/44)

## [0.5.2](https://github.com/nx-dotnet/nx-dotnet/compare/v0.5.1...v0.5.2) (2021-05-18)

### Bug Fixes

- **core:** dep-graph with various directory separators ([3beccb4](https://github.com/nx-dotnet/nx-dotnet/commit/3beccb468e17053ee6c121f408c83cb4c1dafb1d)), closes [#43](https://github.com/nx-dotnet/nx-dotnet/issues/43)

## [0.5.1](https://github.com/nx-dotnet/nx-dotnet/compare/v0.5.0...v0.5.1) (2021-05-06)

### Bug Fixes

- **core:** [#38](https://github.com/nx-dotnet/nx-dotnet/issues/38) - Misc fixes for .gitignore updates ([#40](https://github.com/nx-dotnet/nx-dotnet/issues/40)) ([5f2d5c9](https://github.com/nx-dotnet/nx-dotnet/commit/5f2d5c9407927992398df3d3827256da952ab3e5))
- **core:** sync command should list package names ([#41](https://github.com/nx-dotnet/nx-dotnet/issues/41)) ([8bdc66a](https://github.com/nx-dotnet/nx-dotnet/commit/8bdc66aaf02e2c18c051a5ebf6da99e6438ae318)), closes [#39](https://github.com/nx-dotnet/nx-dotnet/issues/39)

# [0.5.0](https://github.com/nx-dotnet/nx-dotnet/compare/v0.4.2...v0.5.0) (2021-05-06)

### Features

- **core:** add executor for dotnet publish [#33](https://github.com/nx-dotnet/nx-dotnet/issues/33) ([#36](https://github.com/nx-dotnet/nx-dotnet/issues/36)) ([ac8c898](https://github.com/nx-dotnet/nx-dotnet/commit/ac8c89825bfcdd9cd2432e1325bfc2a83255652e))

## [0.4.2](https://github.com/nx-dotnet/nx-dotnet/compare/v0.4.1...v0.4.2) (2021-05-05)

### Bug Fixes

- **core:** [#34](https://github.com/nx-dotnet/nx-dotnet/issues/34) remove spec files from built plugin ([f075046](https://github.com/nx-dotnet/nx-dotnet/commit/f07504625a62ea79afb48b5d3c390ace8202e2ea))
- **core:** [#35](https://github.com/nx-dotnet/nx-dotnet/issues/35) dry run is not passed to dotnet new ([8e0b398](https://github.com/nx-dotnet/nx-dotnet/commit/8e0b3986ad4f5f780bd28f0f69ef5502bb75e2d7))

## [0.4.1](https://github.com/nx-dotnet/nx-dotnet/compare/v0.4.0...v0.4.1) (2021-05-03)

### Bug Fixes

- **core:** test projects not generating ([28d3d1e](https://github.com/nx-dotnet/nx-dotnet/commit/28d3d1ef14ba41169cb33a73bb4de8fda2da13c0))

# [0.4.0](https://github.com/nx-dotnet/nx-dotnet/compare/v0.3.0...v0.4.0) (2021-05-01)

### Bug Fixes

- **repo:** update .releaserc to commit package.json version back ([36d2f30](https://github.com/nx-dotnet/nx-dotnet/commit/36d2f30af70c864ad689123486a3471622a8cd01))

### Features

- **core:** schematic for adding npm package [#5](https://github.com/nx-dotnet/nx-dotnet/issues/5) ([4f37be7](https://github.com/nx-dotnet/nx-dotnet/commit/4f37be7065d351539fe22c30d94866382693ed3f)), closes [#6](https://github.com/nx-dotnet/nx-dotnet/issues/6)
- **core:** support for single version principle [#6](https://github.com/nx-dotnet/nx-dotnet/issues/6) ([#32](https://github.com/nx-dotnet/nx-dotnet/issues/32)) ([8e60a13](https://github.com/nx-dotnet/nx-dotnet/commit/8e60a131d2e6522c3ad01788ab06cdf234d99cf3))

# [0.3.0](https://github.com/nx-dotnet/nx-dotnet/compare/v0.2.1...v0.3.0) (2021-04-28)

### Bug Fixes

- **core:** [#20](https://github.com/nx-dotnet/nx-dotnet/issues/20) test template arg cannot be passed from command line ([e9e47e0](https://github.com/nx-dotnet/nx-dotnet/commit/e9e47e01e227f458cef41c3511bba69032dcf449))
- **repo:** semantic-release not updating package.json ([9273001](https://github.com/nx-dotnet/nx-dotnet/commit/9273001d385a3e1da1ed4edcc8411641b5c2e280))

### Features

- **core:** dotnet test support [#20](https://github.com/nx-dotnet/nx-dotnet/issues/20) ([02ceed0](https://github.com/nx-dotnet/nx-dotnet/commit/02ceed0ae846d6a75de03f4fae5c4cb814ca2742))

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
