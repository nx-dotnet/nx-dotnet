import {
  Tree,
  readProjectConfiguration,
  readJson,
  writeJson,
} from '@nrwl/devkit';
import { execSync } from 'child_process';
import { getAffectedProjects, isDryRun } from '../../utils';

export default async function (
  host: Tree,
  schema: { all?: boolean; specific?: string }
) {
  const projects = getAffectedProjects(schema.all, schema.specific);
  projects.forEach((x) => {
    const projectConfiguration = readProjectConfiguration(host, x);
    const outputPath = projectConfiguration.targets?.build?.options?.outputPath;
    const pkg = `${projectConfiguration.root}/package.json`;
    if (outputPath && host.exists(pkg)) {
      const v = readJson(host, pkg);
      const [prev, tag] = v.version.split('-');
      const [branch, rev] = tag ? tag.split('.') : ['dev', '0'];
      const newVersion = `${prev}-${branch}.${parseInt(rev) + 1}`;
      writeJson(host, pkg, { ...v, version: newVersion });
      if (!isDryRun()) {
        execSync(
          `yarn publish --tag dev --new-version ${newVersion} --no-git-tag-version`,
          { stdio: 'inherit', cwd: outputPath }
        );
        execSync(`git tag ${x}v${newVersion} && git add ${pkg}`, {
          stdio: 'inherit',
        });
      }
    }
  });
  if (!isDryRun()) {
    execSync(`git commit -m "chore(): bump version" && git push --tags`);
  }
}
