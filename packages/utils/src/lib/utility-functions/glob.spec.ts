import { findProjectFileInPath, findProjectFileInPathSync } from './glob';

const dotnetProjectFiles = [
  'packages/utils/fixtures/cs/file.csproj',
  'packages/utils/fixtures/fs/file.fsproj',
  'packages/utils/fixtures/vb/file.vbproj',
];

describe('Glob util functions', () => {
  describe('findProjectFileInPath', () => {
    it('should find .net project file', async () => {
      const result = await Promise.all([
        findProjectFileInPath('packages/utils/fixtures/cs'),
        findProjectFileInPath('packages/utils/fixtures/fs'),
        findProjectFileInPath('packages/utils/fixtures/vb'),
      ]);

      expect(result).toEqual(dotnetProjectFiles);
    });

    it('should ignore non .net project files', async () => {
      await expect(
        findProjectFileInPath('packages/utils/fixtures/other'),
      ).rejects.toThrow(
        `Unable to find a build-able project within project's source directory!`,
      );
    });
  });

  describe('findProjectFileInPathSync', () => {
    it('should find .net project file synchronously', () => {
      const result = [
        findProjectFileInPathSync('packages/utils/fixtures/cs'),
        findProjectFileInPathSync('packages/utils/fixtures/fs'),
        findProjectFileInPathSync('packages/utils/fixtures/vb'),
      ];

      expect(result).toEqual(dotnetProjectFiles);
    });

    it('should ignore non .net project files', () => {
      expect(() =>
        findProjectFileInPathSync('packages/utils/fixtures/other'),
      ).toThrow(
        `Unable to find a build-able project within project's source directory!`,
      );
    });
  });
});
