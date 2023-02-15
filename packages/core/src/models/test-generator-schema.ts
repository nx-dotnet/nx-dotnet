export interface NxDotnetTestGeneratorSchema {
  name: string;
  testTemplate: 'xunit' | 'nunit' | 'mstest';
  language: string;
  suffix?: string;
  pathScheme: 'nx' | 'dotnet';
}
