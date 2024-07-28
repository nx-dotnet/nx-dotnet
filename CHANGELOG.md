# [2.3.0](https://github.com/nx-dotnet/nx-dotnet/compare/v2.2.0...v2.3.0) (2024-07-27)


### Bug Fixes

* **core:** remove warning "Project 'xxx' contains extension with invalid name (type)." ([#831](https://github.com/nx-dotnet/nx-dotnet/issues/831)) ([4c19278](https://github.com/nx-dotnet/nx-dotnet/commit/4c19278ce430cfc6409fb736ab50ccd41de31bfa))
* **nx-ghpages:** syncWithBaseBranch should be a boolean option ([1306ceb](https://github.com/nx-dotnet/nx-dotnet/commit/1306ceb47ee3811c32f905a9a4864ea7fb2212c4))


### Features

* **core:** update to nx 19 ([#857](https://github.com/nx-dotnet/nx-dotnet/issues/857)) ([d349830](https://github.com/nx-dotnet/nx-dotnet/commit/d349830c274243ebd703807e1e0c4abdc4c3e590))
* **nx-ghpages:** add support for passing GH_TOKEN or GITHUB_TOKEN via env to auth with remote ([0fe2d02](https://github.com/nx-dotnet/nx-dotnet/commit/0fe2d02acf043f70d369a7d230a29e7b8154aa85))
* **nx-ghpages:** add support for writing CNAME file ([3a098f0](https://github.com/nx-dotnet/nx-dotnet/commit/3a098f08dc0987d0ccbc637fd385ed3dad499f10))
* **nx-ghpages:** add syncGitOptions to provide extra flags to the command when syncing changes ([e015a98](https://github.com/nx-dotnet/nx-dotnet/commit/e015a985724bcf7c0fcfe1c37868b4098883f189))

# [2.2.0](https://github.com/nx-dotnet/nx-dotnet/compare/v2.1.2...v2.2.0) (2024-01-31)

### Bug Fixes

- **core:** remove restriction of configuration ([#823](https://github.com/nx-dotnet/nx-dotnet/issues/823)) ([49b341f](https://github.com/nx-dotnet/nx-dotnet/commit/49b341ff81fde6f815f4a75f06d552907a79b8ae))
- **dotnet:** prevent "false" being incorrectly passed to dotnet command ([#818](https://github.com/nx-dotnet/nx-dotnet/issues/818)) ([0945571](https://github.com/nx-dotnet/nx-dotnet/commit/0945571169dac0df375d1381daa36bee46e14647))

### Features

- add options to sync the `gh-pages` branch with the base branch … ([#815](https://github.com/nx-dotnet/nx-dotnet/issues/815)) ([d9fff67](https://github.com/nx-dotnet/nx-dotnet/commit/d9fff6795b26df42bde5198d2d5cb2f8a1e527bf))
- **core:** update inference configuration ([#822](https://github.com/nx-dotnet/nx-dotnet/issues/822)) ([6085c50](https://github.com/nx-dotnet/nx-dotnet/commit/6085c500dd17612217334d20a6b53786d8896396))

## [2.1.2](https://github.com/nx-dotnet/nx-dotnet/compare/v2.1.1...v2.1.2) (2023-11-29)

### Bug Fixes

- **core:** do not use --verify-no-changes false for linting ([#802](https://github.com/nx-dotnet/nx-dotnet/issues/802)) ([9026fcf](https://github.com/nx-dotnet/nx-dotnet/commit/9026fcff4b6b5630a04d209275e422ce9d777263))

## [2.1.1](https://github.com/nx-dotnet/nx-dotnet/compare/v2.1.0...v2.1.1) (2023-10-31)

### Bug Fixes

- **core:** update localization files ([#795](https://github.com/nx-dotnet/nx-dotnet/issues/795)) ([7213b67](https://github.com/nx-dotnet/nx-dotnet/commit/7213b67ff01eb2a8e1ca1b98d3fee564e25c9f42))

# [2.1.0](https://github.com/nx-dotnet/nx-dotnet/compare/v2.0.2...v2.1.0) (2023-10-25)

### Bug Fixes

- **core:** should be able to pass extra args to generated libraries ([#788](https://github.com/nx-dotnet/nx-dotnet/issues/788)) ([2d2cb5b](https://github.com/nx-dotnet/nx-dotnet/commit/2d2cb5bb5b1d2f3ea9398c89a1be119133516333)), closes [#783](https://github.com/nx-dotnet/nx-dotnet/issues/783)

### Features

- **core:** better configuration options for target inference ([#787](https://github.com/nx-dotnet/nx-dotnet/issues/787)) ([8a7b9a1](https://github.com/nx-dotnet/nx-dotnet/commit/8a7b9a171c120320c04895320148e3b13635c029))

## [2.0.2](https://github.com/nx-dotnet/nx-dotnet/compare/v2.0.1...v2.0.2) (2023-10-24)

### Bug Fixes

- **core:** options should be read correctly for project inference ([#785](https://github.com/nx-dotnet/nx-dotnet/issues/785)) ([0e5b73d](https://github.com/nx-dotnet/nx-dotnet/commit/0e5b73dd385751b171b6ee6aa5f27f1961a347c9))
- **dotnet:** correct flag passed to client to verify no changes ([#786](https://github.com/nx-dotnet/nx-dotnet/issues/786)) ([eab2d48](https://github.com/nx-dotnet/nx-dotnet/commit/eab2d487718d98d6289e3882ff01dd8d1ef3eee2))

## [2.0.1](https://github.com/nx-dotnet/nx-dotnet/compare/v2.0.0...v2.0.1) (2023-10-20)

### Bug Fixes

- **core:** createDependencies should work on windows ([#782](https://github.com/nx-dotnet/nx-dotnet/issues/782)) ([472fedc](https://github.com/nx-dotnet/nx-dotnet/commit/472fedca4b8d1a01ce97973fa94126b8f882ef50))

# [2.0.0](https://github.com/nx-dotnet/nx-dotnet/compare/v1.23.0...v2.0.0) (2023-10-20)

### Bug Fixes

- **core:** move generator not updating paths correctly ([#767](https://github.com/nx-dotnet/nx-dotnet/issues/767)) ([6398a06](https://github.com/nx-dotnet/nx-dotnet/commit/6398a06709d49c8b137c19ab48124a0e714b04a9))

### Features

- **core:** migrate to v16 and nx plugin API v2 ([#763](https://github.com/nx-dotnet/nx-dotnet/issues/763)) ([4451e8a](https://github.com/nx-dotnet/nx-dotnet/commit/4451e8adf96b4d5cc4284f24a3fc59b2d250cbf9))
- **core:** nx 17 support ([#778](https://github.com/nx-dotnet/nx-dotnet/issues/778)) ([33344cd](https://github.com/nx-dotnet/nx-dotnet/commit/33344cd461426e7a12db2572b039246e17eb39d2))
- **core:** support allSourceTags ([#768](https://github.com/nx-dotnet/nx-dotnet/issues/768)) and wildcards in check-module-boundaries.js ([#771](https://github.com/nx-dotnet/nx-dotnet/issues/771)) ([b55c597](https://github.com/nx-dotnet/nx-dotnet/commit/b55c597a0ad3b81f272af213fe0b57e1d2554999))

### BREAKING CHANGES

- **core:** Drops Nx v15 support

# [1.23.0](https://github.com/nx-dotnet/nx-dotnet/compare/v1.22.0...v1.23.0) (2023-09-20)

### Bug Fixes

- **core:** add slash to use exact path ([#685](https://github.com/nx-dotnet/nx-dotnet/issues/685)) ([#687](https://github.com/nx-dotnet/nx-dotnet/issues/687)) ([1a87d83](https://github.com/nx-dotnet/nx-dotnet/commit/1a87d83e65e60e977028a531ef6acb922424d8fd))
- **core:** codegen should not import self and default to required reference types ([#761](https://github.com/nx-dotnet/nx-dotnet/issues/761)) ([2310556](https://github.com/nx-dotnet/nx-dotnet/commit/231055688035fd4df41a090f70d1497b442f5373))
- **core:** obey path in solution-file parameter when generating projects ([#762](https://github.com/nx-dotnet/nx-dotnet/issues/762)) ([29c234d](https://github.com/nx-dotnet/nx-dotnet/commit/29c234de25467f7693c63ecc206dc90c5b2155d0))
- **core:** support new name for enforce-module-boundaries eslint rule ([#742](https://github.com/nx-dotnet/nx-dotnet/issues/742)) ([24eb831](https://github.com/nx-dotnet/nx-dotnet/commit/24eb831567906ef20febeaadacac886f2a4c7835))
- **core:** update-swagger executor always reinstalls tool ([#757](https://github.com/nx-dotnet/nx-dotnet/issues/757)) ([63cf4b4](https://github.com/nx-dotnet/nx-dotnet/commit/63cf4b43cd92b9943c8c8cab85d61ba83e223674))
- **dotnet:** update args handling for dotnet format ([#678](https://github.com/nx-dotnet/nx-dotnet/issues/678)) ([772303e](https://github.com/nx-dotnet/nx-dotnet/commit/772303e62e3e8661e101146132f2af180a949767))

### Features

- **core:** add argument forwarding to dotnet new ([#722](https://github.com/nx-dotnet/nx-dotnet/issues/722)) ([cdc3654](https://github.com/nx-dotnet/nx-dotnet/commit/cdc36543c7f1c4551a69466619a0e0e8039b7e82))
- **core:** make swagger tool run in project directory ([#758](https://github.com/nx-dotnet/nx-dotnet/issues/758)) ([12d89ac](https://github.com/nx-dotnet/nx-dotnet/commit/12d89ac38f62f64c43a303a9063b46e9e5ecfb6b))

# [1.22.0](https://github.com/nx-dotnet/nx-dotnet/compare/v1.21.1...v1.22.0) (2023-04-12)

### Bug Fixes

- **core:** import-projects should add project.json file for new projects ([#675](https://github.com/nx-dotnet/nx-dotnet/issues/675)) ([69068af](https://github.com/nx-dotnet/nx-dotnet/commit/69068af91400ba3a33ac64208e60f589cc2fe9f7))

### Features

- **core:** add preset generator ([#676](https://github.com/nx-dotnet/nx-dotnet/issues/676)) ([57725ea](https://github.com/nx-dotnet/nx-dotnet/commit/57725ead33165092ac81859f494559667f35fb7d))

## [1.21.1](https://github.com/nx-dotnet/nx-dotnet/compare/v1.21.0...v1.21.1) (2023-03-22)

### Bug Fixes

- **core:** use for of on loop on project Map ([#661](https://github.com/nx-dotnet/nx-dotnet/issues/661)) ([c9d31d7](https://github.com/nx-dotnet/nx-dotnet/commit/c9d31d75baf28399810df8dccfbc34d07bd2b5e1))

# [1.21.0](https://github.com/nx-dotnet/nx-dotnet/compare/v1.20.0...v1.21.0) (2023-03-18)

### Features

- **core:** extra parameters support for run tool ([#658](https://github.com/nx-dotnet/nx-dotnet/issues/658)) ([fe4bc14](https://github.com/nx-dotnet/nx-dotnet/commit/fe4bc147254f310f6404774d78dea9a86227a6ac))

# [1.20.0](https://github.com/nx-dotnet/nx-dotnet/compare/v1.19.1...v1.20.0) (2023-03-10)

### Bug Fixes

- **core:** add @trumbitta/nx-plugin-openapi via the Tree ([c2f2781](https://github.com/nx-dotnet/nx-dotnet/commit/c2f27811d06ecd1b989b37cd6d4dccd39421d6ec))
- **core:** app generation should work in encapuslated Nx workspaces ([13c0a2c](https://github.com/nx-dotnet/nx-dotnet/commit/13c0a2ca50c1119f26bb1f841b3dcdf1a9e91f15))
- **core:** app swaggerLib generation should work using dotnet pathScheme ([#645](https://github.com/nx-dotnet/nx-dotnet/issues/645)) ([6443e32](https://github.com/nx-dotnet/nx-dotnet/commit/6443e32351dea9a048f2641aada5ce29db81b65b))
- **core:** check glob for array length ([#647](https://github.com/nx-dotnet/nx-dotnet/issues/647)) ([8033f76](https://github.com/nx-dotnet/nx-dotnet/commit/8033f762b0faeb0010999d2764235a0c8d39e57b))
- **core:** handle null npm scope properly ([455199a](https://github.com/nx-dotnet/nx-dotnet/commit/455199a7a3999de3e4ab52ef9c2da84d17868674))
- **core:** prevent stale cache entries from breaking swagger on dotnet upgrades ([#633](https://github.com/nx-dotnet/nx-dotnet/issues/633)) ([71f6893](https://github.com/nx-dotnet/nx-dotnet/commit/71f6893fc1d1e2105ae67eb94da0010a3b217a24))
- **core:** remove dependency on memfs and properly specify nx-plugin-openapi as optional peer dep ([cf8f8c3](https://github.com/nx-dotnet/nx-dotnet/commit/cf8f8c3e15ddb87d3a3c873a7b078a9d4496ffca))
- **core:** remove dependency on workspace package.json ([d95a3ff](https://github.com/nx-dotnet/nx-dotnet/commit/d95a3ff972a767e956f960dbd998d97260137a09))

### Features

- **core:** nx 15.8.0 support ([897e1a0](https://github.com/nx-dotnet/nx-dotnet/commit/897e1a0c6008f40cd035924a3af27fc8aa44d715))

## [1.19.1](https://github.com/nx-dotnet/nx-dotnet/compare/v1.19.0...v1.19.1) (2023-02-04)

### Bug Fixes

- **core:** adjust gitignore to support generation with directory ([#599](https://github.com/nx-dotnet/nx-dotnet/issues/599)) ([b3856e0](https://github.com/nx-dotnet/nx-dotnet/commit/b3856e0f04811fa06bda6870fa4058a908d715a5))
- **core:** remove orphaned publish-local ([#611](https://github.com/nx-dotnet/nx-dotnet/issues/611)) ([7985e14](https://github.com/nx-dotnet/nx-dotnet/commit/7985e1496f226e187eb9c58c5e8dc86e3250d29e))

# [1.19.0](https://github.com/nx-dotnet/nx-dotnet/compare/v1.18.1...v1.19.0) (2023-02-01)

### Bug Fixes

- **core:** install not ran after generating a webapi with useNxPluginOpenAPI ([#601](https://github.com/nx-dotnet/nx-dotnet/issues/601)) ([15e4db5](https://github.com/nx-dotnet/nx-dotnet/commit/15e4db5a0b2388f6a90d7943855fbce66a46fc34))
- **core:** make eslint optional dependency ([#608](https://github.com/nx-dotnet/nx-dotnet/issues/608)) ([3705469](https://github.com/nx-dotnet/nx-dotnet/commit/37054699d4c77b0abe5818e272df8e6a4cae1f34))

### Features

- **core:** add support for notDependOnLibsWithTags module boundaries ([#592](https://github.com/nx-dotnet/nx-dotnet/issues/592)) ([483086b](https://github.com/nx-dotnet/nx-dotnet/commit/483086b40308156984bd463bdb28799a260292cd))

## [1.18.1](https://github.com/nx-dotnet/nx-dotnet/compare/v1.18.0...v1.18.1) (2023-01-26)

### Bug Fixes

- **core:** build intermediates need to be captured by cache for DTE / parallel builds ([#596](https://github.com/nx-dotnet/nx-dotnet/issues/596)) ([cdea76e](https://github.com/nx-dotnet/nx-dotnet/commit/cdea76e4b52e85071d7354bf3580bac742e68353))
- **core:** resolve startupAssembly to ensure it is always an absolute path ([#595](https://github.com/nx-dotnet/nx-dotnet/issues/595)) ([2ea2570](https://github.com/nx-dotnet/nx-dotnet/commit/2ea25704b65c0079bfc363f3d470b35bccfbca68))

# [1.18.0](https://github.com/nx-dotnet/nx-dotnet/compare/v1.17.0...v1.18.0) (2023-01-17)

### Features

- **core:** support nx-plugin-openapi for more advanced openapi generation ([#589](https://github.com/nx-dotnet/nx-dotnet/issues/589)) ([ee1c7b1](https://github.com/nx-dotnet/nx-dotnet/commit/ee1c7b1918c37be2880a6b5e252019972c2eaeff))

# [1.17.0](https://github.com/nx-dotnet/nx-dotnet/compare/v1.16.3...v1.17.0) (2023-01-14)

### Features

- **core:** add move generator ([#588](https://github.com/nx-dotnet/nx-dotnet/issues/588)) ([d2a1d85](https://github.com/nx-dotnet/nx-dotnet/commit/d2a1d85c29f5024503b5d76d142b1281cc084f9f))
- **core:** enable codegen setup by default for webapis ([#587](https://github.com/nx-dotnet/nx-dotnet/issues/587)) ([fe639d7](https://github.com/nx-dotnet/nx-dotnet/commit/fe639d767261a9a938b76628a1746f992e0e8be1))

## [1.16.3](https://github.com/nx-dotnet/nx-dotnet/compare/v1.16.2...v1.16.3) (2022-12-19)

### Bug Fixes

- **utils:** should be able to find csproj files that start with dot ([#580](https://github.com/nx-dotnet/nx-dotnet/issues/580)) ([253971c](https://github.com/nx-dotnet/nx-dotnet/commit/253971c674ef55cfa5c573e89506f5c411f39105))

## [1.16.2](https://github.com/nx-dotnet/nx-dotnet/compare/v1.16.1...v1.16.2) (2022-11-11)

### Bug Fixes

- **core:** check-module-boundaries should work if single quotes not consumed by shell ([3870b55](https://github.com/nx-dotnet/nx-dotnet/commit/3870b5500761a12aaaf77f18e6ea975802a9ce7f))
- **core:** normalize paths in Directory.Build.targets ([e8bf1bc](https://github.com/nx-dotnet/nx-dotnet/commit/e8bf1bc44adc144e16173085d42c4b5aefe41a81))

## [1.16.1](https://github.com/nx-dotnet/nx-dotnet/compare/v1.16.0...v1.16.1) (2022-11-11)

### Bug Fixes

- **core:** allow open solutions with Visual Studio ([#563](https://github.com/nx-dotnet/nx-dotnet/issues/563)) ([042a9db](https://github.com/nx-dotnet/nx-dotnet/commit/042a9db62ed57a7d16d684d4ef40a88cc58fba30)), closes [#548](https://github.com/nx-dotnet/nx-dotnet/issues/548)
- **core:** usage of MSBuildProjectDirRelativePath should handle paths with white space ([a939c4b](https://github.com/nx-dotnet/nx-dotnet/commit/a939c4b3ced68c1c3234b624355b9b57d9706860))

# [1.16.0](https://github.com/nx-dotnet/nx-dotnet/compare/v1.15.0...v1.16.0) (2022-11-03)

### Bug Fixes

- **core:** check-module-boundaries should not log undefined as project name([#561](https://github.com/nx-dotnet/nx-dotnet/issues/561)) ([5d1bea3](https://github.com/nx-dotnet/nx-dotnet/commit/5d1bea33f0f7e001e274784746382d4a4d67e2e7))
- **core:** import-projects generator shouldn't fail ([8c2188d](https://github.com/nx-dotnet/nx-dotnet/commit/8c2188dc7cdacfc038765caf8a44c5b3d8c3b524))
- **core:** nx v15 prefers output paths that start with {workspaceRoot} ([90b3aab](https://github.com/nx-dotnet/nx-dotnet/commit/90b3aab2856af4f50107a506b4c3a41bbbc6b6a3))

### Features

- **core:** allow disabling project inference from config file ([2c8eeeb](https://github.com/nx-dotnet/nx-dotnet/commit/2c8eeebe927e548630b6fc4692a9969c6510ec8d))

# [1.15.0](https://github.com/nx-dotnet/nx-dotnet/compare/v1.14.0...v1.15.0) (2022-10-18)

### Bug Fixes

- **core:** getProjectFilesForProject should consider project root in addition to source root ([#543](https://github.com/nx-dotnet/nx-dotnet/issues/543)) ([374e30f](https://github.com/nx-dotnet/nx-dotnet/commit/374e30f2be1f6ede5ac4c4145cbe33f6b75738af))

### Features

- **nx-ghpages:** add option to customize commit message to `gh-pages` ([#542](https://github.com/nx-dotnet/nx-dotnet/issues/542)) ([cff00e0](https://github.com/nx-dotnet/nx-dotnet/commit/cff00e04be43581a323c3f6f0f0a6f1769d1f76e))

# [1.14.0](https://github.com/nx-dotnet/nx-dotnet/compare/v1.13.4...v1.14.0) (2022-10-05)

### Features

- **core:** adding templates with default output path properties to init generator ([#526](https://github.com/nx-dotnet/nx-dotnet/issues/526)) ([c57fbd3](https://github.com/nx-dotnet/nx-dotnet/commit/c57fbd33dec87fe882617a8b39bc11e91d937615))

## [1.13.4](https://github.com/nx-dotnet/nx-dotnet/compare/v1.13.3...v1.13.4) (2022-09-07)

### Bug Fixes

- **core:** .sqlproj is a valid project extension ([#523](https://github.com/nx-dotnet/nx-dotnet/issues/523)) ([5d4f2d6](https://github.com/nx-dotnet/nx-dotnet/commit/5d4f2d6a273c1d1060a1db2c03e6a58d693b7175))

## [1.13.3](https://github.com/nx-dotnet/nx-dotnet/compare/v1.13.2...v1.13.3) (2022-09-06)

### Bug Fixes

- **core:** add extraParameters support to build and test executors ([#514](https://github.com/nx-dotnet/nx-dotnet/issues/514)) ([c6c648d](https://github.com/nx-dotnet/nx-dotnet/commit/c6c648db4f7067c6668771a064bfc0c330d39386))

## [1.13.2](https://github.com/nx-dotnet/nx-dotnet/compare/v1.13.1...v1.13.2) (2022-08-29)

### Bug Fixes

- **core:** remove duplicate imports generated by swagger-typescript ([#502](https://github.com/nx-dotnet/nx-dotnet/issues/502)) ([0fc17d4](https://github.com/nx-dotnet/nx-dotnet/commit/0fc17d459f6ad805a199f51368dbfab080c5ac8f))

## [1.13.1](https://github.com/nx-dotnet/nx-dotnet/compare/v1.13.0...v1.13.1) (2022-08-19)

### Bug Fixes

- **core:** @nrwl/js is required for library generation ([#484](https://github.com/nx-dotnet/nx-dotnet/issues/484)) ([13e2c93](https://github.com/nx-dotnet/nx-dotnet/commit/13e2c93d17486c497b362e69959553223d0d7591))
- **core:** use strict proj glob pattern ([#495](https://github.com/nx-dotnet/nx-dotnet/issues/495)) ([9720168](https://github.com/nx-dotnet/nx-dotnet/commit/97201684cdbd91578047c4aceaf6ac6078cc7db7))

# [1.13.0](https://github.com/nx-dotnet/nx-dotnet/compare/v1.12.0...v1.13.0) (2022-07-29)

### Bug Fixes

- **core:** skip-swagger-lib should be true while experimental ([92cd2d8](https://github.com/nx-dotnet/nx-dotnet/commit/92cd2d8a8be554de74091761404be4fa2901f63a))

### Features

- **core:** added pathScheme for project generators ([#464](https://github.com/nx-dotnet/nx-dotnet/issues/464)) ([ded5eb8](https://github.com/nx-dotnet/nx-dotnet/commit/ded5eb8ad789d1cc3e71b729507a50d6146a1ae9))
- **core:** generate typescript models from swagger/openapi project ([#447](https://github.com/nx-dotnet/nx-dotnet/issues/447)) ([cd56d1c](https://github.com/nx-dotnet/nx-dotnet/commit/cd56d1c4e08a632462cc5354f0965ffe8684a9b4))

# [1.12.0](https://github.com/nx-dotnet/nx-dotnet/compare/v1.11.0...v1.12.0) (2022-06-08)

### Bug Fixes

- **core:** compatibility with Nx 14.2+ ([1bb134b](https://github.com/nx-dotnet/nx-dotnet/commit/1bb134b6367b0d6da1950204b2eb2879764bd1e3))

### Features

- **core:** allow tool installation to be skipped for update-swagger ([d1044f6](https://github.com/nx-dotnet/nx-dotnet/commit/d1044f6eb5080beec8d1b31eed2c8610d85c825d))

# [1.11.0](https://github.com/nx-dotnet/nx-dotnet/compare/v1.10.1...v1.11.0) (2022-05-31)

### Features

- **core:** executor to generate swagger json ([#437](https://github.com/nx-dotnet/nx-dotnet/issues/437)) ([6c33d1a](https://github.com/nx-dotnet/nx-dotnet/commit/6c33d1a9bd87a900a4c7818e21fb0945e1fa2a9b))

## [1.10.1](https://github.com/nx-dotnet/nx-dotnet/compare/v1.10.0...v1.10.1) (2022-05-20)

### Bug Fixes

- **core:** remove workaround for broken dotnet format builtin ([#443](https://github.com/nx-dotnet/nx-dotnet/issues/443)) ([e0f04eb](https://github.com/nx-dotnet/nx-dotnet/commit/e0f04ebfdd7addc4b5aac3a4662959f356a9562e))

# [1.10.0](https://github.com/nx-dotnet/nx-dotnet/compare/v1.9.12...v1.10.0) (2022-05-18)

### Features

- **core:** update prompt for installed template to present available options ([#436](https://github.com/nx-dotnet/nx-dotnet/issues/436)) ([5a941ae](https://github.com/nx-dotnet/nx-dotnet/commit/5a941ae0ac4c4a30290604a23ce3b0e1bed89619))

## [1.9.12](https://github.com/nx-dotnet/nx-dotnet/compare/v1.9.11...v1.9.12) (2022-04-25)

### Bug Fixes

- **dotnet:** dotnet watch --project ... test should work ([#426](https://github.com/nx-dotnet/nx-dotnet/issues/426)) ([1575dda](https://github.com/nx-dotnet/nx-dotnet/commit/1575dda3ffa96ad956bfd75e4cd283188bb6fb5b)), closes [#425](https://github.com/nx-dotnet/nx-dotnet/issues/425)

## [1.9.11](https://github.com/nx-dotnet/nx-dotnet/compare/v1.9.10...v1.9.11) (2022-04-21)

### Bug Fixes

- **core:** replace glob with fast-glob to speed up dep-graph calculation ([#414](https://github.com/nx-dotnet/nx-dotnet/issues/414)) ([5db4ca9](https://github.com/nx-dotnet/nx-dotnet/commit/5db4ca97b15be49080ff1e18e2fa016d7c86deec)), closes [#410](https://github.com/nx-dotnet/nx-dotnet/issues/410)
- **dotnet:** expand env vars in cli parameters ([#422](https://github.com/nx-dotnet/nx-dotnet/issues/422)) ([c2db0cd](https://github.com/nx-dotnet/nx-dotnet/commit/c2db0cd3700d29aef682b3be482dcb82d262b0b6))

## [1.9.10](https://github.com/nx-dotnet/nx-dotnet/compare/v1.9.9...v1.9.10) (2022-04-13)

### Bug Fixes

- **core:** fall back to root if source root null ([#408](https://github.com/nx-dotnet/nx-dotnet/issues/408)) ([53bdc17](https://github.com/nx-dotnet/nx-dotnet/commit/53bdc173874817488897bd6adba186c18da57c81))
- **core:** resolved package version not provided ([#407](https://github.com/nx-dotnet/nx-dotnet/issues/407)) ([9bbc7c1](https://github.com/nx-dotnet/nx-dotnet/commit/9bbc7c1144f4fb2dfa4722b9b4d3c6466ca5189d))
- **core:** test executor should fail properly ([#411](https://github.com/nx-dotnet/nx-dotnet/issues/411)) ([e2db293](https://github.com/nx-dotnet/nx-dotnet/commit/e2db293473655494b0a775da0def84d6b1fd841c))

## [1.9.9](https://github.com/nx-dotnet/nx-dotnet/compare/v1.9.8...v1.9.9) (2022-04-01)

### Bug Fixes

- **core:** post-install shouldn't depend on nx packages ([07811c7](https://github.com/nx-dotnet/nx-dotnet/commit/07811c76dbf6ba7be048ad4e12c41e577ac4864b))

## [1.9.8](https://github.com/nx-dotnet/nx-dotnet/compare/v1.9.7...v1.9.8) (2022-04-01)

### Bug Fixes

- **core:** update nx to not publish \*.ts files ([3fa88c4](https://github.com/nx-dotnet/nx-dotnet/commit/3fa88c4cb104db37f9c918a98226480915da33b6))

## [1.9.7](https://github.com/nx-dotnet/nx-dotnet/compare/v1.9.6...v1.9.7) (2022-03-25)

### Bug Fixes

- **core:** allow opt-out of project inference ([#402](https://github.com/nx-dotnet/nx-dotnet/issues/402)) ([84bde4c](https://github.com/nx-dotnet/nx-dotnet/commit/84bde4ce485225345f0e1d3faf8e06169bdcf32d))
- **dotnet:** update handling of extraParameters to be compatible with spawn ([#403](https://github.com/nx-dotnet/nx-dotnet/issues/403)) ([65f0c48](https://github.com/nx-dotnet/nx-dotnet/commit/65f0c48c46f4f5b3da2022ce51e26d6aaae6b306))

## [1.9.6](https://github.com/nx-dotnet/nx-dotnet/compare/v1.9.5...v1.9.6) (2022-03-10)

### Bug Fixes

- **core:** add workaround for broken .NET format command in v6+ ([#397](https://github.com/nx-dotnet/nx-dotnet/issues/397)) ([2d09657](https://github.com/nx-dotnet/nx-dotnet/commit/2d0965744b1abd574a511168a5b0ae92a7eeed21))

## [1.9.5](https://github.com/nx-dotnet/nx-dotnet/compare/v1.9.4...v1.9.5) (2022-03-03)

### Bug Fixes

- **dotnet:** should work with paths that contain spaces ([#392](https://github.com/nx-dotnet/nx-dotnet/issues/392)) ([fa86355](https://github.com/nx-dotnet/nx-dotnet/commit/fa8635518a5cd6cb0c262dc8926b8d32bfa894ca))

## [1.9.4](https://github.com/nx-dotnet/nx-dotnet/compare/v1.9.3...v1.9.4) (2022-03-01)

### Bug Fixes

- **core:** process project graph shouldn't throw if not a .NET project ([#390](https://github.com/nx-dotnet/nx-dotnet/issues/390)) ([4d51ea0](https://github.com/nx-dotnet/nx-dotnet/commit/4d51ea06d70307b8907a10adb26ca12ea7b0c886))

## [1.9.3](https://github.com/nx-dotnet/nx-dotnet/compare/v1.9.2...v1.9.3) (2022-03-01)

### Bug Fixes

- **core:** infer-projects should work with nx daemon ([#383](https://github.com/nx-dotnet/nx-dotnet/issues/383)) ([acf47cf](https://github.com/nx-dotnet/nx-dotnet/commit/acf47cfaab6c6a125be6fb8205733c639977a203))

## [1.9.2](https://github.com/nx-dotnet/nx-dotnet/compare/v1.9.1...v1.9.2) (2022-02-28)

### Bug Fixes

- **dotnet:** project with spaces do not bug out the command ([#379](https://github.com/nx-dotnet/nx-dotnet/issues/379)) ([dd4e16b](https://github.com/nx-dotnet/nx-dotnet/commit/dd4e16b109b51aba296c5faf9ce9d0c6fa4929c3))

## [1.9.1](https://github.com/nx-dotnet/nx-dotnet/compare/v1.9.0...v1.9.1) (2022-02-15)

### Bug Fixes

- **docs-site:** fix deployment script ([b3052a1](https://github.com/nx-dotnet/nx-dotnet/commit/b3052a1b4f6ee2feccb8154747fbd261955dd48c))

## [1.9.0](https://github.com/nx-dotnet/nx-dotnet/compare/v1.8.0...v1.9.0) (2022-02-15)

### Bug Fixes

- **core:** dependencies should be added to graph when running under nx daemon

### Features

- **core:** support for Nx project inference

# [1.8.0](https://github.com/nx-dotnet/nx-dotnet/compare/v1.7.1...v1.8.0) (2021-12-14)

### Bug Fixes

- **core:** add test projects to solution ([9090b99](https://github.com/nx-dotnet/nx-dotnet/commit/9090b997c4cd3a2409b1a4d119a4445a4a5eb3e1))
- **core:** aliases were not being picked up when generating projects w/ solution files ([56c770a](https://github.com/nx-dotnet/nx-dotnet/commit/56c770a673413f3c832060f6f90d6fc6f67f2644))

### Features

- **core:** support for nx incremental builds ([6739a6b](https://github.com/nx-dotnet/nx-dotnet/commit/6739a6ba5d2aa7181f46704c705b1f72811c648e))

## [1.7.1](https://github.com/nx-dotnet/nx-dotnet/compare/v1.7.0...v1.7.1) (2021-12-11)

### Bug Fixes

- **core:** prebuild script fails if no module boundaries rule is present ([bff34d0](https://github.com/nx-dotnet/nx-dotnet/commit/bff34d05ec577129ffd52017c6f6abd625a81ae2))

# [1.7.0](https://github.com/nx-dotnet/nx-dotnet/compare/v1.6.0...v1.7.0) (2021-11-29)

### Features

- **core:** support for workspace solution files ([#254](https://github.com/nx-dotnet/nx-dotnet/issues/254)) ([ec342ae](https://github.com/nx-dotnet/nx-dotnet/commit/ec342ae2699b7ca5fad0aee717d67ded3c0a9524))

# [1.6.0](https://github.com/nx-dotnet/nx-dotnet/compare/v1.5.2...v1.6.0) (2021-10-22)

### Features

- **core:** support nx v13 ([#226](https://github.com/nx-dotnet/nx-dotnet/issues/226)) ([3524ef9](https://github.com/nx-dotnet/nx-dotnet/commit/3524ef9ad1abcb4b7762d4c0294d015a5925245e))

## [1.5.2](https://github.com/nx-dotnet/nx-dotnet/compare/v1.5.1...v1.5.2) (2021-10-19)

### Bug Fixes

- **core:** remove extra space in `dotnet run --project` ([bf67bf3](https://github.com/nx-dotnet/nx-dotnet/commit/bf67bf36630a38028197655033e0f22aa5ff7b08)), closes [#223](https://github.com/nx-dotnet/nx-dotnet/issues/223)

## [1.5.1](https://github.com/nx-dotnet/nx-dotnet/compare/v1.5.0...v1.5.1) (2021-10-15)

### Bug Fixes

- **core:** nx lint {project} should work when cwd !== appRootPath ([#216](https://github.com/nx-dotnet/nx-dotnet/issues/216)) ([9fac321](https://github.com/nx-dotnet/nx-dotnet/commit/9fac32125852d4e5c6d05056351e3a8065759968)), closes [#215](https://github.com/nx-dotnet/nx-dotnet/issues/215)

# [1.5.0](https://github.com/nx-dotnet/nx-dotnet/compare/v1.4.3...v1.5.0) (2021-10-15)

### Features

- **core:** @nx-dotnet/core:serve can be ran with --watch false ([#210](https://github.com/nx-dotnet/nx-dotnet/issues/210)) ([9fd60e4](https://github.com/nx-dotnet/nx-dotnet/commit/9fd60e4f2b6d94ebcea9eef6253897cb367ba0e7)), closes [#151](https://github.com/nx-dotnet/nx-dotnet/issues/151)
- **core:** check for .net sdk install on package add ([#212](https://github.com/nx-dotnet/nx-dotnet/issues/212)) ([2ec5de9](https://github.com/nx-dotnet/nx-dotnet/commit/2ec5de9c32dafee4970b016bb5e8eeb1896e8906))
- **core:** project references with reference output assembly=false are implicit deps ([#211](https://github.com/nx-dotnet/nx-dotnet/issues/211)) ([34f87ee](https://github.com/nx-dotnet/nx-dotnet/commit/34f87ee6fb9ba5b9407ee9da3aa2c16e663fa617))

## [1.4.3](https://github.com/nx-dotnet/nx-dotnet/compare/v1.4.2...v1.4.3) (2021-10-14)

### Bug Fixes

- **core:** Check SDK and tool installation before running format command ([#204](https://github.com/nx-dotnet/nx-dotnet/issues/204)) ([3ad6291](https://github.com/nx-dotnet/nx-dotnet/commit/3ad62910ad5d4146bcc8e8b85196fd18d9e37da2)), closes [#179](https://github.com/nx-dotnet/nx-dotnet/issues/179) [#202](https://github.com/nx-dotnet/nx-dotnet/issues/202)

## [1.4.2](https://github.com/nx-dotnet/nx-dotnet/compare/v1.4.1...v1.4.2) (2021-09-27)

### Bug Fixes

- use exact project paths ([#143](https://github.com/nx-dotnet/nx-dotnet/issues/143)) ([7a3c5e9](https://github.com/nx-dotnet/nx-dotnet/commit/7a3c5e9bb00a893508cf47a3f1e0979108b75d78)), closes [#125](https://github.com/nx-dotnet/nx-dotnet/issues/125)

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

- **utils:** forEachDependantProject should work on Unix ([96cbc33](https://github.com/nx-dotnet/nx-dotnet/commit/96cbc33ec6b5e9d0492fba4902ee76938230b146)), closes [#43](https://github.com/nx-dotnet/nx-dotnet/issues/43)

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
