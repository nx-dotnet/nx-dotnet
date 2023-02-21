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
} from '@nrwl/devkit';

import { DotNetClient, dotnetFactory } from '@nx-dotnet/dotnet';
import {
  CONFIG_FILE_PATH,
  isDryRun,
  NxDotnetConfig,
  resolve,
} from '@nx-dotnet/utils';
import type { PackageJson } from 'nx/src/utils/package-json';
import * as path from 'path';

const noop = () => void 0;

export async function initGenerator(
  host: Tree,
  _: null, // Nx will populate this with options, which are currently unused.
  dotnetClient = new DotNetClient(dotnetFactory()),
) {
  const tasks: GeneratorCallback[] = [];
  const initialized = host.isFile(CONFIG_FILE_PATH);

  const configObject: NxDotnetConfig = initialized
    ? readJson(host, CONFIG_FILE_PATH)
    : {
        nugetPackages: {},
      };

  configObject.nugetPackages = configObject.nugetPackages || {};

  host.write(CONFIG_FILE_PATH, JSON.stringify(configObject, null, 2));

  updateNxJson(host);

  if (!initialized) {
    addPrepareScript(host);
    tasks.push(installNpmPackages(host));
  }

  initToolManifest(host, dotnetClient);

  initBuildCustomization(host);

  return async () => {
    for (const task of tasks) {
      await task();
    }
  };
}

export default initGenerator;

function installNpmPackages(host: Tree): GeneratorCallback {
  if (host.exists('package.json')) {
    const packageJson = readJson<PackageJson>(host, 'package.json');
    const nxVersion: string =
      packageJson.devDependencies?.['nx'] ??
      (packageJson.dependencies?.['nx'] as string);
    return addDependenciesToPackageJson(
      host,
      {},
      {
        '@nrwl/js': nxVersion,
      },
    );
  } else {
    return noop;
  }
}

function updateNxJson(host: Tree) {
  const nxJson: NxJsonConfiguration = readJson(host, 'nx.json');
  nxJson.plugins = nxJson.plugins || [];
  if (!nxJson.plugins.some((x) => x === '@nx-dotnet/core')) {
    nxJson.plugins.push('@nx-dotnet/core');
  }
  writeJson(host, 'nx.json', nxJson);
}

function initToolManifest(host: Tree, dotnetClient: DotNetClient) {
  const initialized = host.exists('.config/dotnet-tools.json');
  if (!initialized && !isDryRun()) {
    logger.log('Tool Manifest created for managing local .NET tools');
    dotnetClient.new('tool-manifest');
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
