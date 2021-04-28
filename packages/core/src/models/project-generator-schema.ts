/**
 * Typing for the shared project generator's options
 */
export interface NxDotnetProjectGeneratorSchema {
  name: string;
  tags?: string;
  directory?: string;
  template: string;
  language: string;
  testTemplate: 'nunit' | 'mstest' | 'xunit' | 'none';
  skipOutputPathManipulation: boolean;
}
