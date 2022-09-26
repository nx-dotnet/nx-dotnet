export interface NxDotnetTestGeneratorSchema {
  name: string;
  testTemplate: 'xunit' | 'nunit' | 'mstest';
  language: string;
  suffix?: string;
  standalone: boolean;
  pathScheme: 'nx' | 'dotnet';
}
