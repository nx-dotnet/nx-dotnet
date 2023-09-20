const { execSync } = require('child_process');
const { join } = require('path');
const parser = require('yargs-parser');

const cwd = join(__dirname, '../../../');
let { verbose } = parser(process.argv, { boolean: ['verbose'] });
const excluded = 'workspace-plugin';
verbose ||= process.env.VERBOSE_LOGGING;

export function getChangedFiles(
  base = 'master',
  directory = '.',
): { changedFiles: string[]; newFiles: string[] } {
  const ancestor = execSync(`git merge-base HEAD ${base} `).toString().trim();
  let cmd = `git diff --name-only ${ancestor} -- ${directory}`;
  if (verbose) {
    cmd += ' --verbose';
  }
  console.log(`📁 Finding changed files with "${cmd}"`);
  const changedFiles: string[] = execSync(cmd, {
    cwd,
    stdio: ['pipe', 'pipe', 'ignore'],
  })
    .toString()
    .split('\n')
    .slice(0, -1);
  cmd = `git ls-files -z -o --exclude-standard -- ${directory}`;
  console.log(`📂 Finding new files with "${cmd}"`);
  const output = execSync(cmd, { cwd }).toString();
  const newFiles: string[] = output.trim().length ? output.split(' ') : [];
  return { changedFiles, newFiles };
}

console.log(`📖 Checking for documentation changes`);
let generateCmd = `nx g @nx-dotnet/nxdoc:generate-docs --exclude=${excluded}`;
if (verbose) {
  generateCmd += ' --verbose-logging';
}
execSync(generateCmd, {
  stdio: verbose ? 'inherit' : 'ignore',
});
const { changedFiles, newFiles } = getChangedFiles('HEAD', 'docs');
if (changedFiles.length) {
  console.log(`❌ Found changes in docs files`);
  changedFiles.forEach((file) => {
    console.log(`    - ${file}`);
    if (verbose || process.env.VERBOSE_LOGGING) {
      execSync(`git --no-pager diff --minimal HEAD -- ${file}`, {
        stdio: ['inherit', 'inherit', 'inherit'],
      });
    }
  });
}
if (newFiles.length) {
  console.log(`❌ Found new docs files`);
  newFiles.forEach((file) => {
    console.log(`    - ${file}`);
  });
}
if (changedFiles.length || newFiles.length) {
  console.log('➡ Please commit these changes.');
  process.exit(1);
}
