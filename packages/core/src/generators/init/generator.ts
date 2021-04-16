import {
  formatFiles,
  Tree,
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
