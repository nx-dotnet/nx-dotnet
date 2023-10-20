import {
  formatFiles,
  NX_VERSION,
  output,
  readNxJson,
  Tree,
  updateNxJson,
} from '@nx/devkit';

import {
  CONFIG_FILE_PATH,
  NxDotnetConfig,
  readConfigFromRCFile,
} from '@nx-dotnet/utils';
import { deepStrictEqual } from 'node:assert';
import { major } from 'semver';

export async function moveConfigToNxJson(tree: Tree) {
  if (major(NX_VERSION) < 17) {
    warnLowVersion();
    return;
  }

  const configFileConfig = readConfigFromRCFile(tree);
  if (!configFileConfig) {
    console.log('Already done');
    return;
  }

  const nxJson = readNxJson(tree);
  const pluginIndex = nxJson?.plugins?.findIndex((p) =>
    typeof p === 'string'
      ? p === '@nx-dotnet/core'
      : p.plugin === '@nx-dotnet/core',
  );

  if (!nxJson?.plugins || pluginIndex === undefined || pluginIndex < 0) {
    return;
  }

  const plugin = nxJson.plugins[pluginIndex];
  if (typeof plugin !== 'string') {
    handleAlreadyMigratedConfig(plugin, configFileConfig, tree);
    return;
  }

  nxJson.plugins[pluginIndex] = {
    plugin,
    options: configFileConfig,
  };

  tree.delete(CONFIG_FILE_PATH);
  updateNxJson(tree, nxJson);

  await formatFiles(tree);
}

export default moveConfigToNxJson;

function handleAlreadyMigratedConfig(
  plugin: { plugin: string; options?: unknown },
  configFileConfig: NxDotnetConfig,
  tree: Tree,
) {
  const { options } = plugin;
  if (deepEqual(options, configFileConfig)) {
    tree.delete(CONFIG_FILE_PATH);
  } else {
    output.warn({
      title: 'Partially migrated config detected.',
      bodyLines: [
        'In Nx 17 and higher, the nx-dotnet config should be stored in nx.json.',
      ],
    });
  }
}

function warnLowVersion() {
  const command = process.argv[2];
  if (command === 'generate' || command === 'g') {
    output.warn({
      title: 'Nx 17 and higher is required.',
      bodyLines: [
        'In Nx 17 and higher, the nx-dotnet config should be stored in nx.json. Prior to Nx 17, the config was stored in .nx-dotnetrc.json. If you wish to configure nx-dotnet within nx.json, migrate to Nx 17 first.',
      ],
    });
  }
}

function deepEqual(a: unknown, b: unknown): boolean {
  try {
    deepStrictEqual(a, b);
    return true;
  } catch {
    return false;
  }
}
