import {
  ProjectGraph,
  ProjectGraphBuilder,
  ProjectGraphProcessorContext,
  DependencyType,
  ProjectConfiguration,
} from '@nrwl/devkit';
import { getProjectFileForNxProjectSync } from '@nx-dotnet/utils';
import { readFileSync } from 'fs';
import { XmlDocument, XmlElement } from 'xmldoc';
import { isAbsolute, resolve } from 'path';

const projectRoots: { [key: string]: string } = {};

export function processProjectGraph(
  graph: ProjectGraph,
  context: ProjectGraphProcessorContext
) {
  const builder = new ProjectGraphBuilder(graph);

  Object.entries(context.workspace.projects).forEach(([name, project]) => {
    projectRoots[name] = resolve(project.root);
  });

  Object.entries(context.workspace.projects).forEach(([name, project]) => {
    try {
      visitProject(builder, context, project, name);
    } catch {
      console.warn(`Failed to generate .NET dependencies for ${name}`);
    }
  });

  return builder.getProjectGraph();
}

function visitProject(
  builder: ProjectGraphBuilder,
  context: ProjectGraphProcessorContext,
  project: ProjectConfiguration,
  projectName: string
) {
  const netProjectFilePath = getProjectFileForNxProjectSync(project);

  const xml: XmlDocument = new XmlDocument(
    readFileSync(netProjectFilePath).toString()
  );

  xml.childrenNamed('ItemGroup').forEach((itemGroup) =>
    itemGroup.childrenNamed('ProjectReference').forEach((x: XmlElement) => {
      const includeFilePath = x.attr['Include'];
      let absoluteFilePath: string;
      if (isAbsolute(includeFilePath)) {
        absoluteFilePath = includeFilePath;
      } else {
        absoluteFilePath = resolve(netProjectFilePath, includeFilePath);
      }

      Object.entries(projectRoots).forEach(([dependency, path]) => {
        if (absoluteFilePath.startsWith(path)) {
          builder.addDependency(DependencyType.static, projectName, dependency);
        }
      });
    })
  );
}
