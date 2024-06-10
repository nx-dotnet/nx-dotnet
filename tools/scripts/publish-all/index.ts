import { ProjectsConfigurations, readJsonFile } from '@nx/devkit';

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import * as yargs from 'yargs';

import { readJson, readProjectsConfigurations } from '../../utils';
import { parse } from 'semver';
import { dirname } from 'path';

export async function publishAll(version: string, tag?: string) {
  const workspace: ProjectsConfigurations = await readProjectsConfigurations();

  process.env.NX_DOTNET_NEXT_VERSION = version;

  execSync(
    'npx nx run-many --all --target="build" --exclude="docs-site,tools/**,demo/**"',
    {
      stdio: 'inherit',
    },
  );

  const channelTag = parse(version)?.prerelease?.[0] as string | undefined;
  tag ??= channelTag ?? 'latest';

  const projects = Object.values(workspace.projects);
  const environment = {
    ...process.env,
    NPM_CONFIG_REGISTRY: undefined,
  };

  for (const projectConfiguration of projects) {
    if (projectConfiguration.root.includes('demo')) {
      continue;
    }
    const packageJsonPath = `dist/${projectConfiguration.root}/package.json`;
    if (existsSync(packageJsonPath)) {
      const { private: isPrivate, name } = readJsonFile<{
        private?: boolean;
        name: string;
      }>(packageJsonPath);
      if (!isPrivate) {
        console.log(
          'Publishing',
          projectConfiguration.name,
          '@',
          packageJsonPath,
        );
        execSync(
          `npm publish ${dirname(
            packageJsonPath,
          )} --tag=${tag} --access=public ${
            process.env.GH_TOKEN ? '--provenance' : ''
          }`,
          {
            stdio: 'inherit',
            env: environment,
          },
        );

        if (channelTag && channelTag !== tag) {
          execSync(`npm dist-tag add ${name}@${version} ${channelTag}`, {
            stdio: 'inherit',
            env: environment,
          });
        }
      }
    }
  }
}

async function main() {
  return yargs(process.argv.slice(2))
    .version(false)
    .command({
      command: '$0 <version> [tag]',
      builder: (yargs) =>
        yargs
          .positional('version', {
            required: true,
            type: 'string',
            description: 'Version to publish',
          })
          .positional('tag', {
            required: false,
            type: 'string',
            description:
              'Tag to publish. If not specified, and the version is a prerelease, the tag will be the prerelease name. Otherwise, it will be "latest".',
          }),
      handler: async ({ version, tag }) => {
        await publishAll(version!, tag).catch((err) => {
          console.error(err);
          process.exit(1);
        });
      },
    })
    .parse();
}

if (require.main === module) {
  main()
    .then(() => {
      process.exit(0);
    })
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}
