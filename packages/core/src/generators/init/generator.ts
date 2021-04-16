import {
  addProjectConfiguration,
  formatFiles,
  generateFiles,
  getWorkspaceLayout,
  names,
  offsetFromRoot,
  Tree,
} from '@nrwl/devkit';
import * as path from 'path';
import { InitGeneratorSchema } from './schema';

interface NormalizedSchema extends InitGeneratorSchema {
  projectName: string;
  projectRoot: string;
  projectDirectory: string;
  parsedTags: string[];
}

export default async function (host: Tree) {
  const initialized = host.isFile('nx-dotnet.config.ts');
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
