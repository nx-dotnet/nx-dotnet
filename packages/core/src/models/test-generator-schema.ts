export interface NxDotnetTestGeneratorSchema {
  name: string;
  testTemplate: 'xunit' | 'nunit' | 'mstest';
  language: string;
  suffix?: string;
  skipOutputPathManipulation: boolean;
  standalone: boolean;
  pathScheme: 'nx' | 'dotnet';
}
