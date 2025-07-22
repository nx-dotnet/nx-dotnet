import {
  addDependenciesToPackageJson,
  generateFiles,
  GeneratorCallback,
  logger,
  normalizePath,
  NxJsonConfiguration,
  readJson,
  Tree,
  writeJson,
  NX_VERSION,
  readNxJson,
} from '@nx/devkit';

import { DotNetClient, dotnetFactory } from '@nx-dotnet/dotnet';
import { CONFIG_FILE_PATH, NxDotnetConfig, resolve } from '@nx-dotnet/utils';
import * as path from 'path';
import { major } from 'semver';
import { runDotnetNew } from '../utils/dotnet-new';

const noop = () => void 0;

export async function initGenerator(
  host: Tree,
  _: unknown, // Nx will populate this with options, which are currently unused.
  dotnetClient?: DotNetClient,
) {
  const tasks: GeneratorCallback[] = [];

  // Lazy initialization of dotnet client only when needed
  let lazySafeClient: DotNetClient | null = null;
  const getSafeClient = (): DotNetClient | null => {
    if (lazySafeClient) return lazySafeClient;
    if (dotnetClient) {
      lazySafeClient = dotnetClient;
      return lazySafeClient;
    }
    try {
      lazySafeClient = new DotNetClient(dotnetFactory());
      return lazySafeClient;
    } catch (error) {
      console.warn(
        'Failed to initialize .NET client in init generator:',
        error,
      );
      return null;
    }
  };

  // Prior to Nx 17, nx-dotnet had a custom config file.
  if (major(NX_VERSION) < 17) {
    const configObject: NxDotnetConfig = host.isFile(CONFIG_FILE_PATH)
      ? readJson(host, CONFIG_FILE_PATH)
      : {
          nugetPackages: {},
        };

    configObject.nugetPackages = configObject.nugetPackages || {};

    host.write(CONFIG_FILE_PATH, JSON.stringify(configObject, null, 2));
  }

  const nxJson = readNxJson(host);

  // Adds a `dotnet restore` operation to the prepare script.
  addPrepareScript(host);

  // Adds @nx-dotnet/core to nxJson
  updateNxJson(host, nxJson);

  // Setups up the .config/dotnet-tools.json for managing local .NET tools.
  initToolManifest(host, getSafeClient());

  // Creates Directory.Build.* to customize default C# builds.
  initBuildCustomization(host);

  // Adds @nx/js to package.json
  tasks.push(installNpmPackages(host));

  return async () => {
    for (const task of tasks) {
      await task();
    }
  };
}

export default initGenerator;

function installNpmPackages(host: Tree): GeneratorCallback {
  if (host.exists('package.json')) {
    return addDependenciesToPackageJson(
      host,
      {},
      {
        '@nx/js': NX_VERSION,
      },
    );
  } else {
    return noop;
  }
}

function hasPluginInNxJson(nxJson: NxJsonConfiguration | null): boolean {
  return !!nxJson?.plugins?.some((x) => {
    const plugin = typeof x === 'string' ? x : x.plugin;
    return plugin === '@nx-dotnet/core';
  });
}

function updateNxJson(host: Tree, nxJson: NxJsonConfiguration | null) {
  if (nxJson && !hasPluginInNxJson(nxJson)) {
    nxJson.plugins = nxJson.plugins || [];
    nxJson.plugins.push('@nx-dotnet/core');
    writeJson(host, 'nx.json', nxJson);
  }
}

function initToolManifest(host: Tree, dotnetClient: DotNetClient | null) {
  const initialized = host.exists('.config/dotnet-tools.json');
  if (!initialized) {
    if (!dotnetClient) {
      logger.warn('Skipping tool manifest creation: .NET client not available');
      return;
    }
    logger.log('Tool Manifest created for managing local .NET tools');
    runDotnetNew(host, dotnetClient, 'tool-manifest', {});
  }
}

function addPrepareScript(host: Tree) {
  if (host.exists('package.json')) {
    const packageJson = readJson(host, 'package.json');
    const prepareSteps: string[] =
      packageJson.scripts?.prepare?.split('&&').map((x: string) => x.trim()) ??
      [];

    const restoreScript = 'nx g @nx-dotnet/core:restore';
    if (!prepareSteps.includes(restoreScript)) {
      prepareSteps.push(restoreScript);
    }
    packageJson.scripts ??= {};
    packageJson.scripts.prepare = prepareSteps.join(' && ');
    writeJson(host, 'package.json', packageJson);
  }
}

function initBuildCustomization(host: Tree) {
  const initialized = host.exists('Directory.Build.props');
  if (!initialized) {
    const checkModuleBoundariesScriptPath = normalizePath(
      path.relative(
        host.root,
        resolve('@nx-dotnet/core/src/tasks/check-module-boundaries'),
      ),
    );

    generateFiles(host, path.join(__dirname, 'templates/root'), '.', {
      tmpl: '',
      checkModuleBoundariesScriptPath,
    });
  }
}
