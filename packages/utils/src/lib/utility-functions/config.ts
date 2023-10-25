import {
  NX_VERSION,
  NxJsonConfiguration,
  readJson,
  readJsonFile,
  readNxJson,
  Tree,
  workspaceRoot,
  writeJson,
} from '@nx/devkit';

import { CONFIG_FILE_PATH } from '../constants';
import {
  NxDotnetConfig,
  NxDotnetConfigV1,
  NxDotnetConfigV2,
  ResolvedConfig,
} from '../models';
import { major } from 'semver';

export const DefaultConfigValues: ResolvedConfig = {
  solutionFile: '{npmScope}.nx-dotnet.sln',
  inferProjects: true,
  nugetPackages: {},
  inferredTargets: {
    build: 'build',
    lint: 'lint',
    serve: 'serve',
    test: 'test',
  },
  ignorePaths: [],
  tags: ['nx-dotnet'],
};

export function readConfig(host?: Tree): ResolvedConfig {
  const configFromFile = readConfigFromRCFile(host);
  const configFromNxJson = readConfigFromNxJson(host);
  return deepMerge(
    DefaultConfigValues,
    isNxDotnetConfigV1(configFromFile)
      ? upgradeConfigToV2(configFromFile)
      : configFromFile,
    isNxDotnetConfigV1(configFromNxJson)
      ? upgradeConfigToV2(configFromNxJson)
      : configFromNxJson,
  );
}

export function updateConfig(host: Tree, value: NxDotnetConfigV2) {
  if (major(NX_VERSION) < 17) {
    writeJson(host, CONFIG_FILE_PATH, value);
  } else {
    updateConfigInNxJson(host, value);
  }
}

export function updateConfigInNxJson(host: Tree, value: NxDotnetConfigV2) {
  const nxJson = readNxJson(host);
  if (!nxJson) {
    throw new Error(
      'nx-dotnet requires nx.json to be present in the workspace',
    );
  }
  nxJson.plugins ??= [];
  const pluginIndex = nxJson.plugins.findIndex((p) =>
    typeof p === 'string'
      ? p === '@nx-dotnet/core'
      : p.plugin === '@nx-dotnet/core',
  );
  if (pluginIndex > -1) {
    nxJson.plugins[pluginIndex] = {
      plugin: '@nx-dotnet/core',
      // Remove cast after next beta
      options: value as unknown as Record<string, unknown>,
    };
  } else {
    throw new Error(
      'nx-dotnet requires @nx-dotnet/core to be present in nx.json',
    );
  }
  writeJson(host, 'nx.json', nxJson);
}

export function readConfigSection<T extends keyof NxDotnetConfigV2>(
  host: Tree,
  section: T,
): Partial<NxDotnetConfigV2>[T] {
  const config = readConfig(host);
  return config[section] || DefaultConfigValues[section];
}

export function readConfigFromRCFile(host?: Tree): NxDotnetConfig | null {
  try {
    if (host) {
      return readJson<NxDotnetConfig>(host, CONFIG_FILE_PATH);
    } else {
      return readJsonFile<NxDotnetConfig>(
        `${workspaceRoot}/${CONFIG_FILE_PATH}`,
      );
    }
  } catch {
    return null;
  }
}

export function readConfigFromNxJson(host?: Tree): NxDotnetConfig | null {
  if (major(NX_VERSION) < 17) {
    return null;
  }

  try {
    const nxJson: NxJsonConfiguration | null = host
      ? readNxJson(host)
      : readJsonFile(`${workspaceRoot}/nx.json`);

    const plugin = nxJson?.plugins?.find((p) =>
      typeof p === 'string'
        ? p === '@nx-dotnet/core'
        : p.plugin === '@nx-dotnet/core',
    );

    if (!plugin || typeof plugin === 'string') {
      return null;
    } else {
      return plugin.options as NxDotnetConfig;
    }
  } catch {
    return null;
  }
}

export function deepMerge<T extends object>(
  base: T,
  ...objects: (Partial<T> | null)[]
): T {
  function isObject(obj: unknown): obj is object {
    return !!obj && typeof obj === 'object';
  }

  return objects.reduce((agg, obj) => {
    if (obj === null || obj === undefined) {
      return agg;
    }

    Object.keys(obj).forEach((key) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const aggVal = agg[key];
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const nextVal = obj[key];

      if (Array.isArray(aggVal) && Array.isArray(nextVal)) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        agg[key] = aggVal.concat(...nextVal);
      } else if (isObject(aggVal) && isObject(nextVal)) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        agg[key] = deepMerge(aggVal, nextVal);
      } else {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        agg[key] = nextVal;
      }
    });

    return agg;
  }, JSON.parse(JSON.stringify(base))) as T;
}

export function isNxDotnetConfigV1(
  config: Partial<NxDotnetConfig | null>,
): config is NxDotnetConfigV1 {
  return !!config && 'inferProjectTargets' in config;
}

export function upgradeConfigToV2(config: NxDotnetConfigV1): NxDotnetConfigV2 {
  const { inferProjectTargets, ...v2compatible } = config;

  return {
    ...v2compatible,
    inferredTargets:
      inferProjectTargets !== false
        ? DefaultConfigValues.inferredTargets
        : false,
  };
}
