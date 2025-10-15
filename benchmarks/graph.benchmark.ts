import {
  benchmark,
  beforeEach,
  Variation,
  beforeAll,
  afterEach,
  suite,
  ErrorStrategy,
  MarkdownBenchmarkReporter,
  SuiteReporter,
  BenchmarkReporter,
  Benchmark,
} from 'flexi-bench';
import { Result } from 'flexi-bench/dist/results';
import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const ITERATIONS = 6;
const COOLDOWN_MS = 1000;

function report(benchmark: Benchmark, results: Result[]): void
function report(results: Record<string, Result[]>): void 
function report(benchmarkOrResults: Benchmark | Record<string, Result[]>, results?: Result[]): void {
    if (benchmarkOrResults instanceof Benchmark) {
        const reporter: BenchmarkReporter = new MarkdownBenchmarkReporter({
            outputFile: `./benchmarks/reports/${benchmarkOrResults.name
              .toLowerCase()
              .replace(/ /g, '-')}.md`,
          });
          reporter.report(benchmarkOrResults, results!);
    } else {
        for (const key in benchmarkOrResults) {
            report(new Benchmark(key), benchmarkOrResults[key]);
        }
        writeFileSync('./benchmarks/reports/README.md', `# Benchmark Reports
| Benchmark | Report |
|-----------|--------|
${Object.keys(benchmarkOrResults).map(key => `| ${key} | [View Report](./${key.toLowerCase().replace(/ /g, '-')}.md) |`).join('\n')}
`);
    }
}

class SuiteMarkdownReporter extends MarkdownBenchmarkReporter implements SuiteReporter {
    report = report

    constructor() {
        super({outputFile: 'n/a'})
    }
}

suite('@nx-dotnet/core graph construction speed', (s) => {
  s.withErrorStrategy(ErrorStrategy.DelayedThrow).withReporter(new SuiteMarkdownReporter());

  s.withVariations(
    Variation.FromEnvironmentVariables([['NX_DAEMON', ['true', 'false']]]),
  );


    benchmark('should create this repositories graph (cold)', (bench) => {
      beforeEach(() => {
        execSync('nx reset --only-workspace-data --only-daemon');
      });

      afterEach(async () => {
        // Gives pc some time to cool down
        await new Promise((r) => setTimeout(r, COOLDOWN_MS));
      })

      return bench.withAction('nx show projects').withIterations(ITERATIONS);
    });

    benchmark('should create this repositories graph (warm)', (bench) => {
      // We only really need to reset once here, since we are purposely having a cache
      beforeAll(() => {
        execSync('nx reset --only-workspace-data --only-daemon');
        execSync('nx show projects');
      });
      afterEach(async () => {
        // Gives pc some time to cool down
        await new Promise((r) => setTimeout(r, COOLDOWN_MS));
      })
      return bench.withAction('nx show projects').withIterations(ITERATIONS);
    });
});
