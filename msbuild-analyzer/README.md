# MSBuild Analyzer CLI

A command-line tool that uses Microsoft.Build APIs (ProjectGraph) to analyze .NET project files and output detailed information as JSON.

## Purpose

This tool is designed to be called from the Nx plugin's `create-nodes.ts` and `create-dependencies.ts` files to:
- Parse .NET project files (`.csproj`, `.fsproj`, `.vbproj`)
- Extract project properties, package references, and project-to-project references
- Output structured JSON data for Nx graph construction

## Building

```bash
dotnet build msbuild-analyzer/msbuild-analyzer.csproj -c Release
```

## Usage

The tool accepts project file paths either as command-line arguments or via stdin (one per line):

**Via command-line arguments:**
```bash
dotnet run --project msbuild-analyzer -- path/to/project1.csproj path/to/project2.csproj
```

**Via stdin:**
```bash
echo "path/to/project.csproj" | dotnet run --project msbuild-analyzer
```

## Output Format

The tool outputs a JSON array with one object per project:

```json
[
  {
    "path": "/absolute/path/to/project.csproj",
    "evaluatedProperties": {
      "TargetFramework": "net7.0",
      "OutputType": "Exe",
      "AssemblyName": "MyProject"
    },
    "packageReferences": [
      {
        "Include": "Newtonsoft.Json",
        "Version": "13.0.1"
      }
    ],
    "projectReferences": [
      "../OtherProject/OtherProject.csproj"
    ]
  }
]
```

## Integration with Nx

From TypeScript (`create-nodes.ts` or `create-dependencies.ts`):

```typescript
import { execFileSync } from 'child_process';

function analyzeProjects(projectPaths: string[]): ProjectInfo[] {
  const analyzerPath = 'path/to/msbuild-analyzer.dll';
  const result = execFileSync('dotnet', [analyzerPath, ...projectPaths], {
    encoding: 'utf-8'
  });
  return JSON.parse(result);
}
```

## Technical Details

### MSBuild Locator

The tool uses `Microsoft.Build.Locator` to find and register an MSBuild installation before loading MSBuild types. This is critical for proper operation:

1. **Separation of concerns**: MSBuildLocator registration happens BEFORE any MSBuild types are referenced
2. **ExcludeAssets="runtime"**: MSBuild package references use this to prevent copying assemblies to output
3. **Error handling**: Falls back through multiple registration strategies if primary method fails

### Key Dependencies

- `Microsoft.Build` (v17.8.0+) - Core MSBuild APIs, ProjectGraph
- `Microsoft.Build.Framework` (v17.8.0+) - MSBuild framework types
- `Microsoft.Build.Locator` (v1.5.0+) - Locates MSBuild installations

### Known Issues

- **hostfxr library**: On some macOS/Linux environments, MSBuildLocator may fail to load the `hostfxr` shared library. This is an environment configuration issue, not a code issue.
- **Workaround**: Ensure .NET SDK is properly installed and accessible via PATH, or run the tool from within a dotnet build/test context where MSBuild is already loaded.

##References

- [ProjectGraph Constructor Documentation](https://learn.microsoft.com/en-us/dotnet/api/microsoft.build.graph.projectgraph.-ctor?view=msbuild-17-netcore)
- [Microsoft.Build.Locator Usage Guide](https://learn.microsoft.com/en-us/visualstudio/msbuild/updating-an-existing-application)
- [MSBuildLocator GitHub](https://github.com/microsoft/MSBuildLocator)
