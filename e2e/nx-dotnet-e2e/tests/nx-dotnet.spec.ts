import {
  checkFilesExist,
  ensureNxProject,
  readJson,
  runNxCommandAsync,
  uniq,
} from '@nrwl/nx-plugin/testing';
describe('nx-dotnet e2e', () => {
  it('should create apps, libs, and project references', async (done) => {
    const testApp = uniq('app');
    const testLib = uniq('lib');
    ensureNxProject('@nx-dotnet/core', 'dist/packages/core');
    await runNxCommandAsync(
      `generate @nx-dotnet/core:app ${testApp} --language="C#" --template="webapi"`
    );
    await runNxCommandAsync(
      `generate @nx-dotnet/core:lib ${testLib} --language="C#" --template="classlib"` 
    );

    const output = await runNxCommandAsync(
      `generate @nx-dotnet/core:project-reference ${testApp} ${testLib}`,
    )

    // const result = await runNxCommandAsync(`build ${plugin}`);
    // expect(result.stdout).toContain('Executor ran');

    done();
  });

  // describe('--directory', () => {
  //   it('should create src in the specified directory', async (done) => {
  //     const plugin = uniq('nx-dotnet');
  //     ensureNxProject('@nx-dotnet/core', 'dist/packages/nx-dotnet');
  //     await runNxCommandAsync(
  //       `generate @nx-dotnet/core:nx-dotnet ${plugin} --directory subdir`
  //     );
  //     expect(() =>
  //       checkFilesExist(`libs/subdir/${plugin}/src/index.ts`)
  //     ).not.toThrow();
  //     done();
  //   });
  // });

  // describe('--tags', () => {
  //   it('should add tags to nx.json', async (done) => {
  //     const plugin = uniq('nx-dotnet');
  //     ensureNxProject('@nx-dotnet/core', 'dist/packages/nx-dotnet');
  //     await runNxCommandAsync(
  //       `generate @nx-dotnet/core:nx-dotnet ${plugin} --tags e2etag,e2ePackage`
  //     );
  //     const nxJson = readJson('nx.json');
  //     expect(nxJson.projects[plugin].tags).toEqual(['e2etag', 'e2ePackage']);
  //     done();
  //   });
  // });
});
