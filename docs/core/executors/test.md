# @nx-dotnet/core:test

## Runs test via the dotnet cli

## Options

### testAdapterPath (string)

Path to a directory to be searched for additional test adapters. Only .dll files with suffix .TestAdapter.dll are inspected. If not specified, the directory of the test .dll is searched.

### blame (boolean)

Runs the tests in blame mode. This option is helpful in isolating problematic tests that cause the test host to crash. When a crash is detected, it creates a sequence file in TestResults/&lt;Guid&gt;/&lt;Guid&gt;\_Sequence.xml that captures the order of tests that were run before the crash.

### blameCrash (boolean)

Runs the tests in blame mode and collects a crash dump when the test host exits unexpectedly. This option depends on the version of .NET used, the type of error, and the operating system. For exceptions in managed code, a dump will be automatically collected on .NET 5.0 and later versions. It will generate a dump for testhost or any child process that also ran on .NET 5.0 and crashed. Crashes in native code will not generate a dump. This option works on Windows, macOS, and Linux. Crash dumps in native code, or when using .NET Core 3.1 or earlier versions, can only be collected on Windows, by using Procdump. A directory that contains procdump.exe and procdump64.exe must be in the PATH or PROCDUMP_PATH environment variable. Download the tools. Implies --blame. To collect a crash dump from a native application running on .NET 5.0 or later, the usage of Procdump can be forced by setting the VSTEST_DUMP_FORCEPROCDUMP environment variable to 1.

### blameCrashDumpType (string)

The type of crash dump to be collected. Implies --blame-crash.

### blameCrashCollectAlways (boolean)

Collects a crash dump on expected as well as unexpected test host exit.

### blameHang (boolean)

Run the tests in blame mode and collects a hang dump when a test exceeds the given timeout.

### blameHangDumpType (string)

The type of crash dump to be collected. It should be full, mini, or none. When none is specified, test host is terminated on timeout, but no dump is collected. Implies --blame-hang.

### blameHangTimeout (string)

Per-test timeout, after which a hang dump is triggered and the test host process and all of its child processes are dumped and terminated. The timeout value is specified in one of the following formats:
1.5h, 1.5hour, 1.5hours
90m, 90min, 90minute, 90minutes
5400s, 5400sec, 5400second, 5400seconds
5400000ms, 5400000mil, 5400000millisecond, 5400000milliseconds
When no unit is used (for example, 5400000), the value is assumed to be in milliseconds. When used together with data driven tests, the timeout behavior depends on the test adapter used. For xUnit and NUnit the timeout is renewed after every test case. For MSTest, the timeout is used for all test cases. This option is supported on Windows with netcoreapp2.1 and later, on Linux with netcoreapp3.1 and later, and on macOS with net5.0 or later. Implies --blame and --blame-hang.

### configuration (string)

Defines the build configuration. The default value is Debug, but your project&#39;s configuration could override this default SDK setting.

### collect (string)

Enables data collector for the test run. For more information, see Monitor and analyze test run.
To collect code coverage on any platform that is supported by .NET Core, install Coverlet and use the --collect:&#34;XPlat Code Coverage&#34; option.
On Windows, you can collect code coverage by using the --collect &#34;Code Coverage&#34; option. This option generates a .coverage file, which can be opened in Visual Studio 2019 Enterprise. For more information, see Use code coverage and Customize code coverage analysis.

### diag (string)

Enables diagnostic mode for the test platform and writes diagnostic messages to the specified file and to files next to it. The process that is logging the messages determines which files are created, such as _.host\_&lt;date&gt;.txt for test host log, and _.datacollector\_&lt;date&gt;.txt for data collector log.

### framework (string)

Forces the use of dotnet or .NET Framework test host for the test binaries. This option only determines which type of host to use. The actual framework version to be used is determined by the runtimeconfig.json of the test project. When not specified, the TargetFramework assembly attribute is used to determine the type of host. When that attribute is stripped from the .dll, the .NET Framework host is used.

### filter (string)

Filters out tests in the current project using the given expression. For more information, see the Filter option details section. For more information and examples on how to use selective unit test filtering, see Running selective unit tests.

### logger (string)

Specifies a logger for test results. Unlike MSBuild, dotnet test doesn&#39;t accept abbreviations: instead of -l &#34;console;v=d&#34; use -l &#34;console;verbosity=detailed&#34;. Specify the parameter multiple times to enable multiple loggers.

### noBuild (boolean)

Doesn&#39;t build the test project before running it. It also implicitly sets the - --no-restore flag.

### noRestore (boolean)

Doesn&#39;t execute an implicit restore when running the command.

### output (string)

Directory in which to find the binaries to run. If not specified, the default path is ./bin/&lt;configuration&gt;/&lt;framework&gt;/. For projects with multiple target frameworks (via the TargetFrameworks property), you also need to define --framework when you specify this option. dotnet test always runs tests from the output directory. You can use AppDomain.BaseDirectory to consume test assets in the output directory.

### resultsDirectory (string)

The directory where the test results are going to be placed. If the specified directory doesn&#39;t exist, it&#39;s created. The default is TestResults in the directory that contains the project file.

### runtime (string)

The target runtime to test for.

### settings (string)

The .runsettings file to use for running the tests. The TargetPlatform element (x86|x64) has no effect for dotnet test. To run tests that target x86, install the x86 version of .NET Core. The bitness of the dotnet.exe that is on the path is what will be used for running tests. For more information, see the following resources:

### listTests (boolean)

List the discovered tests instead of running the tests.

### verbosity (string)

Sets the verbosity level of the command. For more information, see LoggerVerbosity.
