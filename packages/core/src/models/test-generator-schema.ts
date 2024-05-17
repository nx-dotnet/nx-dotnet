export interface NxDotnetTestGeneratorSchema {
  targetProject: string;
  testTemplate: 'xunit' | 'nunit' | 'mstest';
  testProjectName?: string;
  language: string;
  suffix?: string;
  pathScheme: 'nx' | 'dotnet';
  tags?: string | string[];
  solutionFile?: string | boolean;
  skipFormat?: boolean;
}
