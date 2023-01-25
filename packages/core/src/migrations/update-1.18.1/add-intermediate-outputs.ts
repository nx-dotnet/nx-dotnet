/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  formatFiles,
  getProjects,
  logger,
  ProjectConfiguration,
  readNxJson,
  Tree,
  updateProjectConfiguration,
  writeJson,
} from '@nrwl/devkit';
import { TargetDefaults } from 'nx/src/config/nx-json';
import { gt } from 'semver';
import { XmlDocument } from 'xmldoc';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const nxVersion = require('nx/package.json').version;

export default function update(host: Tree) {
  const projects = getProjects(host);
  const directoryBuildPropsExists = host.exists('Directory.Build.props');
  const directoryBuildPropsUpdated =
    directoryBuildPropsExists && updateDirectoryBuildProps(host);

  for (const [project, configuration] of projects) {
    const changed = updateTargetOutputs(
      directoryBuildPropsUpdated,
      configuration,
    );
    if (changed) {
      updateProjectConfiguration(host, project, configuration);
    }
  }

  updateTargetDefaults(host, directoryBuildPropsUpdated);

  formatFiles(host);
}

function updateDirectoryBuildProps(host: Tree): boolean {
  const contents = host.read('Directory.Build.props', 'utf-8');
  if (!contents) {
    logger.warn('Unable to read "Directory.Build.props"');
    return false;
  }
  const xml = new XmlDocument(contents);
  const propertyGroups = xml.childrenNamed('PropertyGroup');
  const outputManipulationGroup = propertyGroups.find((group) =>
    group.childNamed('OutputPath'),
  );
  if (!outputManipulationGroup) {
    logger.warn(
      'Unable to find property group containing output manipulation in Directory.Build.props',
    );
    return false;
  }
  outputManipulationGroup.children.push(
    new XmlDocument(
      `<BaseIntermediateOutputPath>$(RepoRoot)dist/intermediates/$(ProjectRelativePath)/obj</BaseIntermediateOutputPath>`,
    ),
  );
  outputManipulationGroup.children.push(
    new XmlDocument(
      `<IntermediateOutputPath>$(BaseIntermediateOutputPath)</IntermediateOutputPath>`,
    ),
  );
  host.write('Directory.Build.props', xml.toString());
  return true;
}

function updateTargetOutputs(
  directoryBuildPropsUpdated: boolean,
  configuration: ProjectConfiguration,
): boolean {
  let changed = false;

  const targets = Object.values(configuration.targets ?? {}).filter(
    (x) => x.executor === '@nx-dotnet/core:build',
  );

  for (const target of targets) {
    if (directoryBuildPropsUpdated) {
      if (!target.outputs?.some((x) => x.includes('intermediates'))) {
        const prefix = gt(nxVersion, '15.0.0-beta.0') ? '{workspaceRoot}/' : '';
        target.outputs?.push(
          prefix + `dist/intermediates/${configuration.root}`,
        );
        changed = true;
      }
    } else {
      if (!target.outputs?.some((x) => x.includes('obj'))) {
        const prefix = gt(nxVersion, '15.0.0-beta.0')
          ? '{projectRoot}/'
          : `${configuration.root}/`;
        target.outputs?.push(prefix + `obj`);
        changed = true;
      }
    }
  }
  return changed;
}

function updateTargetDefaults(host: Tree, directoryBuildPropsUpdated: boolean) {
  let changed = false;
  const nxJson = readNxJson();
  const targetDefaults: TargetDefaults | undefined = nxJson.targetDefaults;

  if (!targetDefaults) {
    return;
  }

  const configuration = targetDefaults['@nx-dotnet/core:build'];
  if (configuration) {
    if (directoryBuildPropsUpdated) {
      if (!configuration.outputs?.some((x) => x.includes('intermediates'))) {
        configuration.outputs?.push(
          `{workspaceRoot}/dist/intermediates/{projectRoot}`,
        );
        changed = true;
      }
    } else {
      if (!configuration.outputs?.some((x) => x.includes('obj'))) {
        configuration.outputs?.push(`{projectRoot}/obj`);
        changed = true;
      }
    }
  }

  if (changed) {
    writeJson(host, 'nx.json', nxJson);
  }
}
