# Contributing to NxDotnet

## Open Issues

- Feel free to work on any issues that are not assigned out to anyone. If you want to work on an issue, leave a comment on it and it will be assigned to you so that multiple people are not working on it.
- If you have an idea that does not fall under a current issue, open a new one so that we can talk it through. It will likely be approved and we can work on building out this plugin together.

## Contributing to the code base

### Branching structure

- Most changes should be branched directly from master. The exceptions are limited to breaking changes.
- Breaking changes should branch off of and pull requests should target "dev".

Dev is kept in sync with master, but breaking changes go here first to limit the frequency with which library consumers should expect a breaking change. New features are fine in master, we just want to avoid alienating our users.

### Commit structure

**_We use semantic release, as well as commitlint._**

Commits should follow the specification laid out in the [Angular contributor guidelines](https://github.com/angular/angular/blob/master/CONTRIBUTING.md#-commit-message-format).

We support the following types:

- feat
- fix
- test
- docs
- chore

Only commits with the feat / fix type will show up in the release notes.

We support the following scopes:

// pkg specific improvements

- dotnet
- core
- typescript

// misc

- ci // improvements to the CI / CD pipelines.
- repo // improvements to the general repository.
