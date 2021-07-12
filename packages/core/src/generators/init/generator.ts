import {
  NxJsonConfiguration,
  readJson,
  readWorkspaceConfiguration,
  Tree,
  WorkspaceConfiguration,
  writeJson,
} from '@nrwl/devkit';

import { DotNetClient, dotnetFactory } from '@nx-dotnet/dotnet';
import { CONFIG_FILE_PATH, NxDotnetConfig } from '@nx-dotnet/utils';

export default async function (
  host: Tree,
  _: null, // Nx will populate this with options, which are currently unused.
  dotnetClient = new DotNetClient(dotnetFactory()),
) {
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
    updateGitIgnore(host, readWorkspaceConfiguration(host));
  }

  initToolManifest(host, dotnetClient);
  addPrepareScript(host);
}

function updateGitIgnore(
  host: Tree,
  workspaceConfiguration: WorkspaceConfiguration,
) {
  if (!host.isFile('.gitignore')) {
    return;
  }
  let lines = (host.read('.gitignore') ?? '').toString();
  lines += `\n${
    workspaceConfiguration.workspaceLayout?.appsDir || 'apps'
  }/*/bin`;
  lines += `\n${
    workspaceConfiguration.workspaceLayout?.appsDir || 'apps'
  }/*/obj`;
  lines += `\n${
    workspaceConfiguration.workspaceLayout?.libsDir || 'libs'
  }/*/bin`;
  lines += `\n${
    workspaceConfiguration.workspaceLayout?.libsDir || 'libs'
  }/*/obj`;
  host.write('.gitignore', lines);
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
  if (!initialized) {
    console.log('Tool Manifest created for managing local .NET tools');
    dotnetClient.new('tool-manifest');
  }
}

function addPrepareScript(host: Tree) {
  const packageJson = readJson(host, 'package.json');
  const prepareSteps: string[] =
    packageJson.scripts.prepare?.split('&&').map((x: string) => x.trim()) ?? [];

  const restoreScript = 'nx g @nx-dotnet/core:restore';
  if (!prepareSteps.includes(restoreScript)) {
    prepareSteps.push(restoreScript);
  }

  packageJson.scripts.prepare = prepareSteps.join(' && ');
  writeJson(host, 'package.json', packageJson);
}
