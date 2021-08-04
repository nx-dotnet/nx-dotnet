export interface NxDotnetTestGeneratorSchema {
  name: string;
  testTemplate: 'xunit' | 'nunit' | 'mstest';
  language: string;
  skipOutputPathManipulation: boolean;
  standalone: boolean;
}
