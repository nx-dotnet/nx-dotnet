---
title: '@nx-dotnet/core:format'
---

# @nx-dotnet/core:format

## Format executor

Formats and lints a project using the dotnet-format tool

## Options

### binarylog

- (string): Log all project or solution load information to a binary log file.

### check

- (boolean): Formats files without saving changes to disk. Terminates with a non-zero exit code if any files were formatted.

Default: `true`

### diagnostics

- (string): A space separated list of diagnostic ids to use as a filter when fixing code style or 3rd party analyzers.

- (array): A list of diagnostic ids to use as a filter when fixing code style or 3rd party analyzers.

### exclude

- (array): A list of relative file or folder paths to exclude from formatting.

### fix

- (boolean): Formats files and saves changes to disk. Equivalent to setting --check=false.

### fixAnalyzers

- (string): Run 3rd party analyzers and apply fixes.

### fixStyle

- (string): Run code style analyzers and apply fixes.

### fixWhitespace

- (boolean): Run whitespace formatting. Run by default when not applying fixes.

### include

- (array): A list of relative file or folder paths to include in formatting. All files are formatted if empty

### noRestore

- (boolean): Doesn't execute an implicit restore before formatting

### report

- (string): Accepts a file path, which if provided, will produce a json report in the given directory.

### verbosity

- (string): Set the verbosity level.

Default: `"minimal"`
