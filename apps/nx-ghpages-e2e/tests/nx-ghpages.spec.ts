import {
  checkFilesExist,
  ensureNxProject,
  readJson,
  runNxCommandAsync,
  uniq,
} from '@nrwl/nx-plugin/testing';
describe('nx-ghpages e2e', () => {
  it('should create nx-ghpages', async (done) => {
    const plugin = uniq('nx-ghpages');
    ensureNxProject('@nx-dotnet/nx-ghpages', 'dist/packages/nx-ghpages');
    await runNxCommandAsync(
      `generate @nx-dotnet/nx-ghpages:nx-ghpages ${plugin}`,
    );

    const result = await runNxCommandAsync(`build ${plugin}`);
    expect(result.stdout).toContain('Executor ran');

    done();
  });

  describe('--directory', () => {
    it('should create src in the specified directory', async (done) => {
      const plugin = uniq('nx-ghpages');
      ensureNxProject('@nx-dotnet/nx-ghpages', 'dist/packages/nx-ghpages');
      await runNxCommandAsync(
        `generate @nx-dotnet/nx-ghpages:nx-ghpages ${plugin} --directory subdir`,
      );
      expect(() =>
        checkFilesExist(`libs/subdir/${plugin}/src/index.ts`),
      ).not.toThrow();
      done();
    });
  });

  describe('--tags', () => {
    it('should add tags to nx.json', async (done) => {
      const plugin = uniq('nx-ghpages');
      ensureNxProject('@nx-dotnet/nx-ghpages', 'dist/packages/nx-ghpages');
      await runNxCommandAsync(
        `generate @nx-dotnet/nx-ghpages:nx-ghpages ${plugin} --tags e2etag,e2ePackage`,
      );
      const nxJson = readJson('nx.json');
      expect(nxJson.projects[plugin].tags).toEqual(['e2etag', 'e2ePackage']);
      done();
    });
  });
});
