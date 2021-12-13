# Handling Solution Files

## Workspace Level

As of v1.7.0, `nx-dotnet` supports adding projects to a workspace level solution file automatically. When generating an app, lib, or test project you can pass `--solutionFile` to add the project to the default solution at the workspace root. Alternatively, you can pass `--solutionFile {path/to/sln}` to add the project to a custom solution file. This should look something like:

```bash
npx nx g @nx-dotnet/core:app my-api --template webapi --solutionFile MyCompany.sln
```

To add projects to a solution file by default, you can set the generator defaults in [nx.json](https://nx.dev/l/a/core-concepts/configuration#nxjson) as below:

```json5
{
  // ... more nx.json configuration
  generators: {
    // ... other default configurations
    '@nx-dotnet/core:application': {
      solutionFile: true,
    },
    // ... other default configurations
    '@nx-dotnet/core:library': {
      solution: 'my-sln.sln',
    },
  },
}
```

> Note that the generator names in `nx.json` must be the full name. Alias's like `app`, `lib` and so on will not be recognized.

## Subgraph Solutions

In a large monorepo, IDEs or other tooling may slow down when presented with a large solution file. Currently, `nx-dotnet` does not assist in managing this issue, but there are a few easy steps to take that can help optimize your workflow. Which path you take will depend on both the tooling you use, and the pains that you are enountering.

Either of the two approaches listed below could be expanded on in the future, but currently are not in the scope of the nx-plugin.

### Separate solution files

One option would be totally separated solution files for project graphs that are not connected. The main thing to be cautious with in an approach like this, is that if the dependency graph changes and the two subgraphs become connected it would be possible to make changes that break a project not currently visible to the IDE. For example, lets say you have 3 projects `A`, `B`, and `Shared`. If `A` and `B` both depend on `Shared`, and you have separate solutions each containing either `A` or `B` alongside the `Shared` project, a developer could modify the code in `Shared` and break the project that was not included in the opened solution file. As such, any solution that contained `Shared` _must_ contain all projects that depend on it to maintain good DX.

### Solution filters

Some IDEs such as Visual Studio support solution filters. These filters would allow for all projects to be visible to the IDE, but can have some performance benefits. The caveats to using separate files can still exist though, but these could be easier to maintain in the long run. Here is a link to the [msdn docs for solution filters](https://docs.microsoft.com/en-us/visualstudio/ide/filtered-solutions?view=vs-2022).
