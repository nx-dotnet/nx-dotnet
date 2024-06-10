import { ProjectType } from '@nx/devkit';

/**
 * Typing for the shared project generator's options
 */
export interface NxDotnetProjectGeneratorSchema {
  name: string;
  tags?: string;
  directory?: string;
  template?: string;
  language: string;
  testTemplate: 'nunit' | 'mstest' | 'xunit' | 'none';
  testProjectNameSuffix?: string;
  projectType?: ProjectType;
  solutionFile?: string | boolean;
  skipSwaggerLib: boolean;
  skipFormat?: boolean;
  pathScheme: 'nx' | 'dotnet';
  useOpenApiGenerator?: boolean;
  namespaceName?: string;
  args?: string[];
  __unparsed__?: string[];
}
