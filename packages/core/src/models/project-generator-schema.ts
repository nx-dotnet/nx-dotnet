export interface NxDotnetProjectGeneratorSchema {
    name: string;
    tags?: string;
    directory?: string;
    template: string;
    language: string;
    "test-template": 'nunit' | 'mstest' | 'xunit' | 'none';
    skipOutputPathManipulation: boolean;
  }