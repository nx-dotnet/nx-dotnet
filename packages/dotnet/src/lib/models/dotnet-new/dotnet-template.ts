export type KnownDotnetTemplates =
  | 'console'
  | 'classlib'
  | 'wpf'
  | 'wpflib'
  | 'wpfcustomcontrollib'
  | 'wpfusercontrollib'
  | 'winforms'
  | 'winformslib'
  | 'worker'
  | 'grpc'
  | 'mstest'
  | 'xunit'
  | 'nunit'
  | 'page'
  | 'viewimports'
  | 'proto'
  | 'blazorserver'
  | 'blazorwasm'
  | 'web'
  | 'mvc'
  | 'webapp'
  | 'angular'
  | 'react'
  | 'reactredux'
  | 'razorclasslib'
  | 'webapi'
  | 'globaljson'
  | string;

export interface DotnetTemplate {
  templateName: string;
  shortNames: string[];
  languages?: string[];
  tags?: string[];
}
