# @nx-dotnet/nxdoc:generate-docs

## Options

### <span className="required">outputDirectory</span>

- (string): Where should the generated docs be placed?

### gettingStartedFile

- (string): File contents to place before the API reference section for each package. &lt;src&gt; is replaced by the package&#39;s root.

### skipFrontMatter

- (boolean): Nxdoc generates frontmatter suitable for docusaurus by default.

### skipFormat

- (boolean): Skips running the output through prettier

### verboseLogging

- (boolean): Print some additional logs during doc generation

### exclude

- (string): A comma separated list of projects that should not be included in documentation

- (array): An array of projects that should not be included in documentation
