export interface NxDotnetTestGeneratorSchema {
  project: string;
  testTemplate: 'xunit' | 'nunit' | 'mstest';
  language: string;
  skipOutputPathManipulation: boolean;
  standalone: boolean;
}
