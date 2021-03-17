import {
  checkFilesExist,
  ensureNxProject,
  readJson,
  runNxCommandAsync,
  uniq,
} from '@nrwl/nx-plugin/testing';
describe('nx-dotnet e2e', () => {
  // it('should create nx-dotnet', async (done) => {
  //   const plugin = uniq('nx-dotnet');
  //   ensureNxProject('@nx-dotnet/core', 'dist/packages/nx-dotnet');
  //   await runNxCommandAsync(
  //     `generate @nx-dotnet/core:nx-dotnet ${plugin}`
  //   );

  //   const result = await runNxCommandAsync(`build ${plugin}`);
  //   expect(result.stdout).toContain('Executor ran');

  //   done();
  // });

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
