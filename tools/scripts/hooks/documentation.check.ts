const { execSync } = require('child_process');
const { join } = require('path');

const cwd = join(__dirname, '../../../');

export function getChangedFiles(base = 'master', directory = '.'): string[] {
  const ancestor = execSync(`git merge-base HEAD ${base} `).toString().trim();
  let cmd = `git diff --name-only ${ancestor} -- ${directory}`;
  console.log(`📁 Finding changed files with "${cmd}"`);
  const changed: string[] = execSync(cmd, {
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
  return changed.concat(newFiles);
}

console.log(`📖 Checking for documentation changes`);
execSync('nx g @nx-dotnet/nxdoc:generate-docs');
const changes = getChangedFiles('HEAD', 'docs');
if (changes.length) {
  console.log(`❌ Found changes in docs files`);
  changes.forEach((file) => {
    console.log(`    - ${file}`);
  });
  console.log('➡ Please commit these changes.');
  process.exit(1);
}
