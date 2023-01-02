import { ProjectType } from '@nrwl/devkit';

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
  standalone: boolean;
  projectType?: ProjectType;
  solutionFile?: string | boolean;
  skipSwaggerLib: boolean;
  pathScheme: 'nx' | 'dotnet';
  /** The additional arguments passed to the generate command are stored here if appended to the end some reason. Ex: "nx g @nx-dotnet/core:app my-app -- --force --no-restore" would result in an array with ['--force', '--no-restore'] */
  _?: string[];
  /** Another location for the arguments to be forwarded to the dotnet command. Useful to allow it to show up in the UI */
  args?: string[];
}
