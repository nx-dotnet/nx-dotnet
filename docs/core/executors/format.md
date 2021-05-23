# @nx-dotnet/core:format

## Format executor

## Options

### noRestore (boolean)

Doesn&#39;t execute an implicit restore before formatting

### fixWhitespace (boolean)

Run whitespace formatting. Run by default when not applying fixes.

### fixStyle (string)

Run code style analyzers and apply fixes.

### fixAnalyzers (string)

Run 3rd party analyzers and apply fixes.

### diagnostics

- (string) A space separated list of diagnostic ids to use as a filter when fixing code style or 3rd party analyzers.

- (array) A list of diagnostic ids to use as a filter when fixing code style or 3rd party analyzers.

### include (array)

A list of relative file or folder paths to include in formatting. All files are formatted if empty

### exclude (array)

A list of relative file or folder paths to exclude from formatting.

### check (boolean)

Formats files without saving changes to disk. Terminates with a non-zero exit code if any files were formatted.

### report (string)

Accepts a file path, which if provided, will produce a json report in the given directory.

### binarylog (string)

Log all project or solution load information to a binary log file.

### verbosity (string)

Set the verbosity level.

### fix (boolean)

Formats files and saves changes to disk. Equivalent to setting --check=false.
