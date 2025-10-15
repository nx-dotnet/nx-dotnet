using System.Text.Json;
using Microsoft.Build.Locator;

// Read project files from stdin (one per line) or from args
var projectFiles = new List<string>();
if (args.Length > 0)
{
    projectFiles.AddRange(args);
}
else
{
    string? line;
    while ((line = Console.ReadLine()) != null && line != "")
    {
        projectFiles.Add(line.Trim());
    }
}

if (projectFiles.Count == 0)
{
    Console.Error.WriteLine("No project files provided. Provide as command-line args or via stdin (one per line).\n");
    return 1;
}

// Set environment variables to help MSBuildLocator find the SDK and native libraries
if (string.IsNullOrEmpty(Environment.GetEnvironmentVariable("DOTNET_ROOT")))
{
    // Try common locations
    var dotnetPath = Environment.GetEnvironmentVariable("PATH")
        ?.Split(Path.PathSeparator)
        .Select(p => Path.Combine(p, "dotnet"))
        .FirstOrDefault(File.Exists);
    
    if (dotnetPath != null)
    {
        var dotnetRoot = Path.GetDirectoryName(dotnetPath);
        Environment.SetEnvironmentVariable("DOTNET_ROOT", dotnetRoot);
        
        // On macOS/Linux, set DYLD_FALLBACK_LIBRARY_PATH / LD_LIBRARY_PATH to help find libhostfxr
        if (OperatingSystem.IsMacOS() || OperatingSystem.IsLinux())
        {
            var hostFxrPath = Path.Combine(dotnetRoot!, "host", "fxr");
            if (Directory.Exists(hostFxrPath))
            {
                var latestFxr = Directory.GetDirectories(hostFxrPath)
                    .OrderByDescending(d => d)
                    .FirstOrDefault();
                    
                if (latestFxr != null)
                {
                    var envVar = OperatingSystem.IsMacOS() ? "DYLD_FALLBACK_LIBRARY_PATH" : "LD_LIBRARY_PATH";
                    var currentValue = Environment.GetEnvironmentVariable(envVar);
                    var newValue = string.IsNullOrEmpty(currentValue) 
                        ? latestFxr 
                        : $"{latestFxr}{Path.PathSeparator}{currentValue}";
                    Environment.SetEnvironmentVariable(envVar, newValue);
                }
            }
        }
    }
}

// Register MSBuild BEFORE any MSBuild types are referenced
// This must be in a separate method that doesn't reference MSBuild types
try
{
    MSBuildLocator.RegisterDefaults();
}
catch (Exception ex)
{
    Console.Error.WriteLine($"Failed to register MSBuild: {ex.Message}");
    return 2;
}

// Now call method that uses MSBuild types
var results = Analyzer.AnalyzeProjects(projectFiles);

var options = new JsonSerializerOptions { WriteIndented = false };
Console.WriteLine(JsonSerializer.Serialize(results, options));
return 0;

// This class is separate so MSBuild types are not loaded until after RegisterDefaults
static class Analyzer
{
    public static List<object> AnalyzeProjects(List<string> projectFiles)
    {
        var results = new List<object>();
        
        // Create a ProjectGraph - use fully qualified names to avoid loading types in main
        var projectGraph = new Microsoft.Build.Graph.ProjectGraph(projectFiles);
        
        // Use ProjectCollection for evaluation
        var projectCollection = new Microsoft.Build.Evaluation.ProjectCollection();
        
        foreach (var node in projectGraph.ProjectNodes)
        {
            try
            {
                var projectPath = node.ProjectInstance?.FullPath;
                if (string.IsNullOrEmpty(projectPath))
                {
                    results.Add(new { error = "Unable to determine project path for node", node = node.GetHashCode() });
                    continue;
                }
        
                // Load the project for evaluation
                var project = projectCollection.LoadProject(projectPath);
        
                // Collect PackageReference items
                var packageRefs = new List<object>();
                foreach (var item in project.GetItems("PackageReference"))
                {
                    packageRefs.Add(new
                    {
                        Include = item.EvaluatedInclude,
                        Version = item.Metadata.FirstOrDefault(m => m.Name == "Version")?.EvaluatedValue
                    });
                }
        
                // Collect ProjectReference items (raw relative paths)
                var projectRefs = new List<string>();
                foreach (var item in project.GetItems("ProjectReference"))
                {
                    projectRefs.Add(item.EvaluatedInclude);
                }
        
                // Collect some evaluated properties useful for inference
                var properties = new Dictionary<string, string>();
                foreach (var prop in new[] { 
                    "TargetFramework", "TargetFrameworks", "OutputType", "AssemblyName",
                    "OutputPath", "OutDir", "TargetPath", "TargetDir", "TargetFileName"
                })
                {
                    var val = project.GetPropertyValue(prop);
                    if (!string.IsNullOrEmpty(val)) properties[prop] = val;
                }
        
                results.Add(new
                {
                    path = projectPath,
                    evaluatedProperties = properties,
                    packageReferences = packageRefs,
                    projectReferences = projectRefs
                });
            }
            catch (Exception ex)
            {
                results.Add(new { error = ex.Message, node = node.ProjectInstance?.FullPath });
            }
        }
        
        return results;
    }
}
