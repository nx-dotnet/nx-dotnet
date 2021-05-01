import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs-extra';

export function build(
  nxVersion,
  ngCliVersion,
  typescriptVersion,
  prettierVersion,
) {
  try {
    execSync('npx nx run-many --target=build --all', {
      stdio: [0, 1, 2],
    });
  } catch {
    console.log('Build failed');
    process.exit(1);
  }

  const BUILD_DIR = 'dist/packages';

  const files = [
    ...['core', 'dotnet', 'typescript', 'utils'].map(
      (f) => `${f}/package.json`,
    ),
  ].map((f) => `${BUILD_DIR}/${f}`);

  files.forEach((f) => {
    let content = readFileSync(f).toString();
    content = content
      .replace(
        /exports.nxVersion = '\*'/g,
        `exports.nxVersion = '${nxVersion}'`,
      )
      .replace(/NX_VERSION/g, nxVersion)
      .replace(/TYPESCRIPT_VERSION/g, typescriptVersion)
      .replace(/PRETTIER_VERSION/g, prettierVersion);

    writeFileSync(f, content);
  });
}
