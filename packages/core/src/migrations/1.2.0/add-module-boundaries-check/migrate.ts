/* eslint-disable @typescript-eslint/no-unused-vars */
import { Tree } from '@nrwl/devkit';
import {
  getNxDotnetProjects,
  getProjectFileForNxProject,
} from '@nx-dotnet/utils';

import { addPrebuildMsbuildTask } from '../../../generators/utils/generate-project';

import { XmlDocument } from 'xmldoc';

export default async function update(host: Tree) {
  const projects = getNxDotnetProjects(host);
  for (const [name, project] of projects.entries()) {
    const projectFilePath = await getProjectFileForNxProject(project);
    const buffer = host.read(projectFilePath);
    if (!buffer) {
      throw new Error(`Error reading file ${projectFilePath}`);
    }
    const xml = new XmlDocument(buffer.toString());
    if (
      !xml
        .childrenNamed('Target')
        .some((x) => x.attr['Name'] === 'CheckNxModuleBoundaries')
    ) {
      addPrebuildMsbuildTask(host, { name, projectRoot: project.root }, xml);
      host.write(projectFilePath, xml.toString());
    }
  }
}
