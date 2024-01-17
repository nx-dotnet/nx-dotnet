import { isDryRun, swapExplicitFalseKeys } from './args';

describe('Args util functions', () => {
  describe('isDryRun', () => {
    it('Should detect dry run flag', () => {
      const before = isDryRun();
      process.argv.push('--dry-run');
      const after = isDryRun();
      expect({ before, after }).toStrictEqual({ before: false, after: true });
    });
  });

  describe('swapExplicitFalseKeys', () => {
    it('should change a value to the string "false" if in the explicit false list', () => {
      const result = swapExplicitFalseKeys(
        {
          fixWhitespace: false,
          fixStyle: true,
          fixAnalyzers: false,
          noBuild: false,
          noDependencies: true,
        },
        ['fixWhitespace', 'fixStyle', 'fixAnalyzers'],
      );
      expect(result).toStrictEqual({
        fixWhitespace: 'false',
        fixStyle: true,
        fixAnalyzers: 'false',
        noBuild: false,
        noDependencies: true,
      });
    });
  });
});
