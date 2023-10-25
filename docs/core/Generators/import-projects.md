# @nx-dotnet/core:import-projects

## Import Projects

Import existing .NET projects in C#, VB, or F# that are in your workspace&#39;s apps or libs directories. Simply move the projects into these folders, and then run `nx g @nx-dotnet/core:import-projects` to move them into Nx. Projects inside the apps directory will include a serve target, while projects inside libs will only contain build + lint targets.
