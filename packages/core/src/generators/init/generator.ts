import {
  formatFiles,
  NxJsonConfiguration,
  readJson,
  Tree,
  writeJson,
} from '@nrwl/devkit';

export default async function (host: Tree) {
  const initialized = host.isFile('nx-dotnet.config.js');
  if (initialized) {
    return;
  }

  host.write('nx-dotnet.config.js', `
module.exports = {

}
  `)


  updateNxJson(host);
  updateGitIgnore(host);
  await formatFiles(host);
}

function updateGitIgnore(host: Tree) {
  if (!host.isFile('.gitignore')) {
    console.warn('Not updating gitignore because it is not present!')
    return;
  }
  let lines = host.read('.gitignore').toString();
  lines += '\r\napps/*/bin'
  lines += '\r\napps/*/obj'
  host.write('.gitignore', lines);
}

function updateNxJson(host: Tree) {
  const nxJson: NxJsonConfiguration = readJson(host, 'nx.json');
  nxJson.plugins = nxJson.plugins || [];
  if (!nxJson.plugins.some(x => x === '@nx-dotnet/core')) {
    nxJson.plugins.push('@nx-dotnet/core');
  }
  writeJson(host, 'nx.json', nxJson);
}
