import { convertOptionsToParams } from './parameters';

describe('convertOptionsToParams', () => {
  it('should change a value to the string "false" if in the explicit false list', () => {
    const options = {
      fixWhitespace: false,
      fixStyle: true,
      fixAnalyzers: false,
      noBuild: false,
      noDependencies: true,
    } as const;
    const result = convertOptionsToParams(options, {
      explicitFalseKeys: ['fixWhitespace', 'fixStyle', 'fixAnalyzers'],
      keyMap: {},
    });
    expect(result).toMatchInlineSnapshot(`
      [
        "--fixWhitespace=false",
        "--fixStyle",
        "--fixAnalyzers=false",
        "--noDependencies",
      ]
    `);
  });

  it('should map a key in the key map', () => {
    const options = {
      fixWhitespace: false,
      fixStyle: true,
      fixAnalyzers: false,
      noBuild: false,
      noDependencies: true,
    } as const;
    const result = convertOptionsToParams(options, {
      explicitFalseKeys: [],
      keyMap: {
        fixWhitespace: 'fix-whitespace',
        fixStyle: 'fix-style',
        fixAnalyzers: 'fix-analyzers',
      },
    });
    expect(result).toMatchInlineSnapshot(`
      [
        "--fix-style",
        "--noDependencies",
      ]
    `);
  });
});
