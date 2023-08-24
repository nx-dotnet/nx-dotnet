export interface DotnetToolsManifestV1 {
  version: 1;
  isRoot: boolean;
  tools: {
    [key: string]: {
      version: string;
      commands: string[];
    };
  };
}

export type DotnetToolsManifest = DotnetToolsManifestV1;
