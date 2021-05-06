import {
  NxJsonConfiguration,
  readJson,
  readWorkspaceConfiguration,
  Tree,
  WorkspaceConfiguration,
  writeJson,
} from '@nrwl/devkit';

import { CONFIG_FILE_PATH, NxDotnetConfig } from '@nx-dotnet/utils';

export default async function (host: Tree) {
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
