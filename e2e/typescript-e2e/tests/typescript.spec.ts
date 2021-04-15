describe('typescript e2e', () => {

  it('has a test', () => {
    expect(true).toBeTruthy();
  })
  // it('should create typescript', async (done) => {
  //   const plugin = uniq('typescript');
  //   ensureNxProject('@nx-dotnet/typescript', 'dist/packages/typescript');
  //   await runNxCommandAsync(
  //     `generate @nx-dotnet/typescript:typescript ${plugin}`
  //   );

  //   const result = await runNxCommandAsync(`build ${plugin}`);
  //   expect(result.stdout).toContain('Executor ran');

  //   done();
  // });

  // describe('--directory', () => {
  //   it('should create src in the specified directory', async (done) => {
  //     const plugin = uniq('typescript');
  //     ensureNxProject('@nx-dotnet/typescript', 'dist/packages/typescript');
  //     await runNxCommandAsync(
  //       `generate @nx-dotnet/typescript:typescript ${plugin} --directory subdir`
  //     );
  //     expect(() =>
  //       checkFilesExist(`libs/subdir/${plugin}/src/index.ts`)
  //     ).not.toThrow();
  //     done();
  //   });
  // });

  // describe('--tags', () => {
  //   it('should add tags to nx.json', async (done) => {
  //     const plugin = uniq('typescript');
  //     ensureNxProject('@nx-dotnet/typescript', 'dist/packages/typescript');
  //     await runNxCommandAsync(
  //       `generate @nx-dotnet/typescript:typescript ${plugin} --tags e2etag,e2ePackage`
  //     );
  //     const nxJson = readJson('nx.json');
  //     expect(nxJson.projects[plugin].tags).toEqual(['e2etag', 'e2ePackage']);
  //     done();
  //   });
  // });
});
