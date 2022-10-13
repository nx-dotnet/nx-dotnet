import {
  getPackageManagerCommand,
  joinPathFragments,
  names,
} from '@nrwl/devkit';
import {
  checkFilesExist,
  ensureNxProject,
  listFiles,
  readFile,
  runCommand,
  runNxCommand,
  runPackageManagerInstall,
  tmpProjPath,
  uniq,
  updateFile,
} from '@nrwl/nx-plugin/testing';
import { runCommandUntil } from '../../utils';

import { unlinkSync, writeFileSync } from 'fs';
import { join } from 'path';
import { XmlDocument } from 'xmldoc';

import { readDependenciesFromNxDepGraph } from '@nx-dotnet/utils/e2e';
import { exec, execSync } from 'child_process';
import { ensureDirSync } from 'fs-extra';
import { Workspaces } from '@nrwl/tao/src/shared/workspace';

const e2eDir = tmpProjPath();

describe('nx-dotnet e2e', () => {
  beforeAll(() => {
    ensureNxProject('@nx-dotnet/core', 'dist/packages/core');
    initializeGitRepo(e2eDir);
  }, 1500000);

  it('should initialize workspace build customization', async () => {
    await runNxCommandAsync(`generate @nx-dotnet/core:init`);

    expect(() =>
      checkFilesExist('Directory.Build.props', 'Directory.Build.targets'),
    ).not.toThrow();
  });

  it('should create apps, libs, and project references', async () => {
    const testApp = uniq('app');
    const testLib = uniq('lib');

    await runNxCommandAsync(
      `generate @nx-dotnet/core:app ${testApp} --language="C#" --template="webapi" --skipSwaggerLib`,
    );

    await runNxCommandAsync(
      `generate @nx-dotnet/core:lib ${testLib} --language="C#" --template="classlib"`,
    );

    const output = await runNxCommandAsync(
      `generate @nx-dotnet/core:project-reference ${testApp} ${testLib}`,
    );

    expect(output.stdout).toMatch(/Reference .* added to the project/);
  });

  it('should work with affected', async () => {
    const testApp = uniq('app');
    const testLib = uniq('lib');

    runCommand('git checkout -b "affected-tests"');
    updateFile('package.json', (f) => {
      const json = JSON.parse(f);
      json.dependencies['@nrwl/angular'] = json.devDependencies['nx'];
      return JSON.stringify(json);
    });
    runPackageManagerInstall();

    await runNxCommandAsync(
      `generate @nrwl/angular:app ng-app --style css --routing false --no-interactive`,
      // { cwd: e2eDir, stdio: 'inherit' },
    );

    await runNxCommandAsync(
      `generate @nx-dotnet/core:app ${testApp} --language="C#" --template="webapi" --skipSwaggerLib`,
    );

    await runNxCommandAsync(
      `generate @nx-dotnet/core:lib ${testLib} --language="C#" --template="classlib"`,
    );

    await runNxCommandAsync(
      `generate @nx-dotnet/core:project-reference ${testApp} ${testLib}`,
    );

    const deps = await readDependenciesFromNxDepGraph(join(e2eDir), testApp);
    expect(deps).toContain(testLib);
    runCommand('git checkout main');
  }, 300000);

  describe('nx g app', () => {
    it('should obey dry-run', async () => {
      const app = uniq('app');
      await runNxCommandAsync(
        `generate @nx-dotnet/core:app ${app} --language="C#" --template="webapi" --skipSwaggerLib --dry-run`,
      );

      expect(() => checkFilesExist(`apps/${app}`)).toThrow();
    });

    it('should generate an app without swagger library', async () => {
      const app = uniq('app');
      await runNxCommandAsync(
        `generate @nx-dotnet/core:app ${app} --language="C#" --template="webapi" --skip-swagger-lib`,
      );

      expect(() => checkFilesExist(`apps/${app}`)).not.toThrow();
      expect(() =>
        checkFilesExist(`libs/generated/${app}-swaggger/project.json`),
      ).toThrow();
    });

    it('should build and test an app', async () => {
      const app = uniq('app');
      const testProj = `${app}-test`;
      await runNxCommandAsync(
        `generate @nx-dotnet/core:app ${app} --language="C#" --template="webapi" --skip-swagger-lib`,
      );

      await runNxCommandAsync(`build ${app}`);
      await runNxCommandAsync(`test ${testProj}`);

      expect(() => checkFilesExist(`apps/${app}`)).not.toThrow();
      expect(() => checkFilesExist(`dist/apps/${app}`)).not.toThrow();
    });

    it('should build an app which depends on a lib', async () => {
      const app = uniq('app');
      const lib = uniq('lib');
      await runNxCommandAsync(
        `generate @nx-dotnet/core:app ${app} --language="C#" --template="webapi" --skip-swagger-lib`,
      );
      await runNxCommandAsync(
        `generate @nx-dotnet/core:lib ${lib} --language="C#" --template="classlib"`,
      );
      await runNxCommandAsync(
        `generate @nx-dotnet/core:project-reference --project ${app} --reference ${lib}`,
      );

      await runNxCommandAsync(`build ${app}`);

      expect(() => checkFilesExist(`apps/${app}`)).not.toThrow();
      expect(() => checkFilesExist(`dist/apps/${app}`)).not.toThrow();
      expect(() => checkFilesExist(`dist/libs/${lib}`)).not.toThrow();
    });

    it('should lint', async () => {
      const app = uniq('app');
      await runNxCommandAsync(
        `generate @nx-dotnet/core:app ${app} --template webapi --language="C#"  --skip-swagger-lib`,
      );
      const promise = runNxCommandAsync(`lint ${app}`);
      await expect(promise).rejects.toThrow(
        expect.objectContaining({
          message: expect.stringContaining('WHITESPACE'),
        }),
      );
    });
  });

  describe('nx g test', () => {
    it('should add a reference to the target project', async () => {
      const app = uniq('app');
      await runNxCommandAsync(
        `generate @nx-dotnet/core:app ${app} --language="C#" --template="webapi" --skip-swagger-lib --test-template="none"`,
      );
      await runNxCommandAsync(
        `generate @nx-dotnet/core:test ${app} --language="C#" --template="nunit"`,
      );

      const config = readFile(
        joinPathFragments(
          'apps',
          `${app}-test`,
          `Proj.${names(app).className}.Test.csproj`,
        ),
      );
      const projectXml = new XmlDocument(config);
      const projectReference = projectXml
        .childrenNamed('ItemGroup')[1]
        ?.childNamed('ProjectReference');

      expect(projectReference).toBeDefined();
    });

    it('should create test project using suffix', async () => {
      const app = uniq('app');
      await runNxCommandAsync(
        `generate @nx-dotnet/core:app ${app} --language="C#" --template="webapi" --skip-swagger-lib --test-template="none"`,
      );
      await runNxCommandAsync(
        `generate @nx-dotnet/core:test ${app} --language="C#" --template="nunit" --suffix="integration-tests"`,
      );

      const config = readFile(
        joinPathFragments(
          'apps',
          `${app}-integration-tests`,
          `Proj.${names(app).className}.IntegrationTests.csproj`,
        ),
      );

      expect(config).toBeDefined();
    });
  });

  describe('nx g lib', () => {
    it('should obey dry-run', async () => {
      const lib = uniq('lib');
      await runNxCommandAsync(
        `generate @nx-dotnet/core:lib ${lib} --language="C#" --template="webapi" --skip-swagger-lib --dry-run`,
      );

      expect(() => checkFilesExist(`libs/${lib}`)).toThrow();
    });

    it('should generate an lib', async () => {
      const lib = uniq('lib');
      await runNxCommandAsync(
        `generate @nx-dotnet/core:lib ${lib} --language="C#" --template="classlib"`,
      );

      expect(() => checkFilesExist(`libs/${lib}`)).not.toThrow();
    });
  });

  describe('nx g using dotnet pathSchema', () => {
    it('no directory', async () => {
      const libName = uniq('CurveDental.Foobar.SomeLib');
      await runNxCommandAsync(
        `generate @nx-dotnet/core:lib ${libName} --language="C#" --template="classlib" --pathScheme=dotnet`,
      );

      expect(() => checkFilesExist(`libs/${libName}`)).not.toThrow();
      expect(() => checkFilesExist(`libs/${libName}.Test`)).not.toThrow();
    });

    it('with directory', async () => {
      const libName = uniq('CurveDental.Foobar.SomeLib');
      await runNxCommandAsync(
        `generate @nx-dotnet/core:lib ${libName} --language="C#" --template="classlib" --pathScheme=dotnet --directory foo`,
      );

      expect(() => checkFilesExist(`libs/foo/${libName}`)).not.toThrow();
      expect(() => checkFilesExist(`libs/foo/${libName}.Test`)).not.toThrow();
    });
  });

  describe('nx g import-projects', () => {
    it('should import apps, libs, and test', async () => {
      const testApp = uniq('app');
      const testLib = uniq('lib');
      const testAppTest = `${testApp}-test`;
      const appDir = `${e2eDir}/apps/${testApp}`;
      const testAppDir = `${e2eDir}/apps/${testAppTest}`;
      const libDir = `${e2eDir}/libs/${testLib}`;
      ensureDirSync(appDir);
      ensureDirSync(libDir);
      ensureDirSync(testAppDir);
      execSync('dotnet new webapi', { cwd: appDir });
      execSync('dotnet new classlib', { cwd: libDir });
      execSync('dotnet new nunit', { cwd: testAppDir });

      await runNxCommandAsync(`generate @nx-dotnet/core:import-projects`);

      const workspace = new Workspaces(e2eDir).readWorkspaceConfiguration();

      expect(workspace.projects[testApp].targets?.serve).toBeDefined();
      expect(workspace.projects[testApp].targets?.build).toBeDefined();
      expect(workspace.projects[testApp].targets?.lint).toBeDefined();
      expect(workspace.projects[testLib].targets?.serve).not.toBeDefined();
      expect(workspace.projects[testLib].targets?.build).toBeDefined();
      expect(workspace.projects[testLib].targets?.lint).toBeDefined();
      expect(workspace.projects[testAppTest].targets?.build).toBeDefined();
      expect(workspace.projects[testAppTest].targets?.lint).toBeDefined();
      expect(workspace.projects[testAppTest].targets?.test).toBeDefined();

      await runNxCommandAsync(`build ${testApp}`);
      checkFilesExist(`dist/apps/${testApp}`);
    });
  });

  describe('solution handling', () => {
    // For solution handling, defaults fall back to if a file exists.
    // This ensures that the tests are ran in a clean state, without previous
    // test projects interfering with the test.
    beforeAll(() => {
      ensureNxProject('@nx-dotnet/core', 'dist/packages/core');
      initializeGitRepo(e2eDir);
    }, 1500000);

    it("shouldn't create a solution by default if not specified", async () => {
      const app = uniq('app');
      await runNxCommandAsync(
        `generate @nx-dotnet/core:app ${app} --language="C#" --skip-swagger-lib --template="webapi"`,
      );

      expect(() => checkFilesExist(`apps/${app}`)).not.toThrow();
      expect(listFiles('.').filter((x) => x.endsWith('.sln'))).toHaveLength(0);
    });

    it('should create a default solution file if specified as true', async () => {
      const app = uniq('app');
      await runNxCommandAsync(
        `generate @nx-dotnet/core:app ${app} --language="C#" --template="webapi" --skip-swagger-lib --solutionFile`,
      );

      expect(() => checkFilesExist(`apps/${app}`)).not.toThrow();
      expect(listFiles('.').filter((x) => x.endsWith('.sln'))).toHaveLength(1);
    });

    it('should create specified solution file if specified as string', async () => {
      const app = uniq('app');
      await runNxCommandAsync(
        `generate @nx-dotnet/core:app ${app} --language="C#" --template="webapi" --solutionFile="MyCompany.sln"`,
      );

      expect(() =>
        checkFilesExist(`apps/${app}`, `MyCompany.sln`),
      ).not.toThrow();
    });

    it('should add successive projects to default solution file', async () => {
      const app1 = uniq('app');
      await runNxCommandAsync(
        `generate @nx-dotnet/core:app ${app1} --language="C#" --skip-swagger-lib --template="webapi" --solutionFile`,
      );

      const app2 = uniq('app2');
      await runNxCommandAsync(
        `generate @nx-dotnet/core:app ${app2} --language="C#" --skip-swagger-lib --template="webapi" --solutionFile`,
      );

      const slnFile = readFile('proj.nx-dotnet.sln');

      expect(() => checkFilesExist(`apps/${app1}`)).not.toThrow();
      expect(slnFile).toContain(app1);
      expect(slnFile).toContain(app2);
    });

    it('should add test project to same solution as app project', async () => {
      const app = uniq('app');
      await runNxCommandAsync(
        `generate @nx-dotnet/core:app ${app} --language="C#" --template="webapi" --skip-swagger-lib --test-template="xunit" --solutionFile`,
      );

      const slnFile = readFile('proj.nx-dotnet.sln');
      expect(() => checkFilesExist(`apps/${app}`)).not.toThrow();
      expect(slnFile).toContain(app);
      expect(slnFile).toContain(app + '-test');
    });
  });

  describe('inferred targets', () => {
    let api: string;
    let projectFolder: string;

    beforeAll(() => {
      api = uniq('api');
      projectFolder = join(e2eDir, 'apps', api);
      ensureDirSync(projectFolder);
      execSync(`dotnet new webapi --language C#`, {
        cwd: projectFolder,
      });
      updateFile('nx.json', (contents) => {
        const json = JSON.parse(contents);
        json.plugins = ['@nx-dotnet/core'];
        return JSON.stringify(json, null, 2);
      });
    });

    it('should work with project.json', () => {
      writeFileSync(
        join(projectFolder, 'project.json'),
        JSON.stringify({
          targets: {},
        }),
      );
      expect(() => runNxCommand(`build ${api}`)).not.toThrow();
    });

    it('should work without project.json', () => {
      const projectJsonContents = readFile(
        joinPathFragments('apps', api, 'project.json'),
      );
      unlinkSync(join(projectFolder, 'project.json'));

      expect(() => runNxCommand(`build ${api}`)).not.toThrow();

      writeFileSync(join(projectFolder, 'project.json'), projectJsonContents);
    });
  });

  describe('@nx-dotnet/core:test', () => {
    it('should test with xunit', () => {
      const appProject = uniq('app');
      const testProject = `${appProject}-test`;
      runNxCommand(
        `generate @nx-dotnet/core:app ${appProject} --language="C#" --template="webapi" --skip-swagger-lib --test-runner xunit`,
      );

      expect(() => runNxCommand(`test ${testProject}`)).not.toThrow();

      updateFile(
        `apps/${testProject}/UnitTest1.cs`,
        `using Xunit;

namespace Proj.${names(appProject).className}.Test;

public class UnitTest1
{
    // This test should fail, as the e2e test is checking for test failures.
    [Fact]
    public void Test1()
    {
      Assert.Equal(1, 2)
    }
}`,
      );

      expect(() => runNxCommand(`test ${testProject}`)).toThrow();
    });

    it('should work with watch', async () => {
      const appProject = uniq('app');
      const testProject = `${appProject}-test`;
      runNxCommand(
        `generate @nx-dotnet/core:app ${appProject} --language="C#" --template="webapi" --skip-swagger-lib --test-runner xunit`,
      );
      const p = runCommandUntil(
        `test ${testProject} --watch`,
        (output) =>
          output.includes(
            'Waiting for a file to change before restarting dotnet...',
          ),
        { kill: true },
      );
      await expect(p).resolves.not.toThrow();
    });
  });

  describe('swagger integration', () => {
    it('should generate swagger project for webapi', async () => {
      const api = uniq('api');
      await runNxCommandAsync(
        `generate @nx-dotnet/core:app ${api} --language="C#" --template="webapi" --skipSwaggerLib=false`,
      );

      expect(() => checkFilesExist(`apps/${api}`)).not.toThrow();
      expect(() =>
        checkFilesExist(`libs/generated/${api}-swagger`),
      ).not.toThrow();
      expect(() => runNxCommand(`swagger ${api}`)).not.toThrow();
      expect(() =>
        checkFilesExist(`libs/generated/${api}-swagger/swagger.json`),
      ).not.toThrow();
    });
  });
});

function initializeGitRepo(cwd: string) {
  runCommand('git init');
  runCommand('git branch -m main');
  runCommand('git config user.email no-one@some-website.com');
  runCommand('git config user.name CI-Bot');
  runCommand('git add .');
  runCommand('git commit -m "initial commit"');
}

function runCommandAsync(
  command: string,
  opts = {
    silenceError: false,
    nxVerboseLogging: true,
  },
) {
  return new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
    exec(
      command,
      {
        cwd: e2eDir,
        env: opts.nxVerboseLogging
          ? { ...process.env, NX_VERBOSE_LOGGING: 'true' }
          : process.env,
      },
      (err, stdout, stderr) => {
        if (!opts.silenceError && err) {
          reject(err);
        }
        resolve({ stdout, stderr });
      },
    );
  });
}
/**
 * Run a nx command asynchronously inside the e2e directory
 * @param command
 * @param opts
 */
function runNxCommandAsync(
  command: string,
  opts = {
    silenceError: false,
    nxVerboseLogging: true,
  },
) {
  const pmc = getPackageManagerCommand();
  return runCommandAsync(`${pmc.exec} nx ${command}`, opts);
}
