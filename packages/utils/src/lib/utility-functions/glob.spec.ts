import { findProjectFileInPath, findProjectFileInPathSync } from './glob';

const dotnetProjectFiles = [
  'packages/utils/src/lib/utility-functions/fixtures/cs/file.csproj',
  'packages/utils/src/lib/utility-functions/fixtures/fs/file.fsproj',
  'packages/utils/src/lib/utility-functions/fixtures/vb/file.vbproj',
];

describe('Glob util functions', () => {
  describe('findProjectFileInPath', () => {
    it('should find .net project file', async () => {
      const result = await Promise.all([
        findProjectFileInPath(
          'packages/utils/src/lib/utility-functions/fixtures/cs',
        ),
        findProjectFileInPath(
          'packages/utils/src/lib/utility-functions/fixtures/fs',
        ),
        findProjectFileInPath(
          'packages/utils/src/lib/utility-functions/fixtures/vb',
        ),
      ]);

      expect(result).toEqual(dotnetProjectFiles);
    });

    it('should ignore non .net project files', async () => {
      await expect(
        findProjectFileInPath(
          'packages/utils/src/lib/utility-functions/fixtures/other',
        ),
      ).rejects.toThrow(
        `Unable to find a build-able project within project's source directory!`,
      );
    });
  });

  describe('findProjectFileInPathSync', () => {
    it('should find .net project file synchronously', () => {
      const result = [
        findProjectFileInPathSync(
          'packages/utils/src/lib/utility-functions/fixtures/cs',
        ),
        findProjectFileInPathSync(
          'packages/utils/src/lib/utility-functions/fixtures/fs',
        ),
        findProjectFileInPathSync(
          'packages/utils/src/lib/utility-functions/fixtures/vb',
        ),
      ];

      expect(result).toEqual(dotnetProjectFiles);
    });

    it('should ignore non .net project files', () => {
      expect(() =>
        findProjectFileInPathSync(
          'packages/utils/src/lib/utility-functions/fixtures/other',
        ),
      ).toThrow(
        `Unable to find a build-able project within project's source directory!`,
      );
    });
  });
});
