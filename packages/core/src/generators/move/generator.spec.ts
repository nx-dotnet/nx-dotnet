import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import {
  Tree,
  readProjectConfiguration,
  addProjectConfiguration,
  joinPathFragments,
  names,
  offsetFromRoot,
  ProjectConfiguration,
} from '@nx/devkit';
import { uniq } from '@nx/plugin/testing';

import generator from './generator';
import { getNamespaceFromSchema } from '../utils/generate-project';

describe('move generator', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace({
      layout: 'apps-libs',
    });
  });

  it('should move simple projects successfully', async () => {
    const { project } = makeSimpleProject(tree, 'app');
    const destination = uniq('app');
    await generator(tree, { projectName: project, destination });
    const config = readProjectConfiguration(tree, destination);
    expect(config).toBeDefined();
    expect(tree.exists(`apps/${destination}/readme.md`)).toBeTruthy();
  });

  it('should move simple projects up a directory', async () => {
    const { project } = makeSimpleProject(tree, 'app', 'test');
    const destination = uniq('app');
    await generator(tree, { projectName: project, destination });
    const config = readProjectConfiguration(tree, destination);
    expect(config).toBeDefined();
    expect(tree.exists(`apps/${destination}/readme.md`)).toBeTruthy();
    expect(tree.exists(`apps/libs/test/readme.md`)).toBeFalsy();
  });

  it('should move simple projects down a directory', async () => {
    const { project } = makeSimpleProject(tree, 'app', 'test');
    const destination = joinPathFragments('test', 'nested', uniq('app'));
    await generator(tree, { projectName: project, destination });
    const config = readProjectConfiguration(
      tree,
      destination.replace(/[\\|/]/g, '-'),
    );
    expect(config).toBeDefined();
    expect(tree.exists(`apps/${destination}/readme.md`)).toBeTruthy();
    expect(tree.exists(`apps/test/readme.md`)).toBeFalsy();
  });

  it('should update project references in referencing .csproj files', async () => {
    const { project, root, namespace } = makeSimpleProject(tree, 'app', 'test');
    const otherCsProjPath = 'apps/other/Proj.Other.csproj';
    tree.write(
      otherCsProjPath,
      `<Project Sdk="Microsoft.NET.Sdk">
    <ItemGroup>
      <ProjectReference Include="../test/${project}/${namespace}.csproj" />
    </ItemGroup>

    <PropertyGroup>
      <TargetFramework>net6.0</TargetFramework>
      <RootNamespace>test_lib2</RootNamespace>
      <ImplicitUsings>enable</ImplicitUsings>
      <Nullable>enable</Nullable>
    </PropertyGroup>
  </Project>
  `,
    );
    const destination = uniq('app');
    console.log(tree.read(otherCsProjPath)?.toString());
    await generator(tree, { projectName: project, destination });
    const config = readProjectConfiguration(
      tree,
      destination.replace(/[\\|/]/g, '-'),
    );
    expect(config).toBeDefined();
    expect(tree.exists(`apps/${destination}/readme.md`)).toBeTruthy();
    expect(tree.exists(`apps/test/readme.md`)).toBeFalsy();
    const updatedCsProj = tree.read(otherCsProjPath)?.toString();
    expect(updatedCsProj).not.toContain(root);
    expect(updatedCsProj).not.toContain(project);
    expect(updatedCsProj).toContain(destination);
  });

  it.each([
    {
      step: 'remain same level as sibling reference',
      from: '',
      to: '',
      sourceReference: '../other/Proj.Other.csproj',
      expectedReference: '../other/Proj.Other.csproj',
    },
    {
      step: 'move down a level from sibling reference',
      from: '',
      to: 'nested',
      sourceReference: '../other/Proj.Other.csproj',
      expectedReference: '../../other/Proj.Other.csproj',
    },
    {
      step: 'move up a level from sibling reference',
      from: 'parent',
      to: '',
      sourceReference: '../other/Proj.Other.csproj',
      expectedReference: '../parent/other/Proj.Other.csproj',
    },
  ])(
    'should offset dependent projects in the moved project .csproj [$step]',
    async ({ from, to, sourceReference, expectedReference }) => {
      const { project, namespace, projectFilePath } = makeSimpleProject(
        tree,
        'app',
        from,
      );
      tree.write(
        projectFilePath,
        `<Project Sdk="Microsoft.NET.Sdk">
    <ItemGroup>
      <ProjectReference Include="${sourceReference}" />
    </ItemGroup>

    <PropertyGroup>
      <TargetFramework>net6.0</TargetFramework>
      <RootNamespace>${namespace}</RootNamespace>
      <ImplicitUsings>enable</ImplicitUsings>
      <Nullable>enable</Nullable>
    </PropertyGroup>
  </Project>
  `,
      );
      console.log(tree.read(projectFilePath)?.toString());
      const destination = joinPathFragments(to, uniq('app'));
      await generator(tree, { projectName: project, destination });
      const destinationNamespace = getNamespaceFromSchema(tree, destination);
      const updatedCsProjPath = `apps/${destination}/${destinationNamespace}.csproj`;
      const updatedCsProj = tree.read(updatedCsProjPath)?.toString();
      expect(updatedCsProj).toContain(
        `<RootNamespace>${destinationNamespace}</RootNamespace>`,
      );
      expect(updatedCsProj).toContain(`Include="${expectedReference}"`);
    },
  );

  it('should rename project file', async () => {
    const { project, projectFilePath } = makeSimpleProject(tree, 'lib', 'a/b');
    tree.write(
      projectFilePath,
      '<Project Sdk="Microsoft.NET.Sdk"><PropertyGroup><TargetFramework>netstandard2.0</TargetFramework></PropertyGroup></Project>',
    );
    const destinationProject = uniq('lib');
    const destination = joinPathFragments('c', 'd', destinationProject);
    await generator(tree, { projectName: project, destination });
    expect(tree.exists(projectFilePath)).toBeFalsy();
    const destinationNamespace = `Proj.C.D.${
      names(destinationProject).className
    }`;
    expect(
      tree.exists(`libs/${destination}/${destinationNamespace}.csproj`),
    ).toBeTruthy();
  });

  it('should update namespace references in referencing project code files', async () => {
    const {
      project,
      root,
      namespace: sourceNamespace,
    } = makeSimpleProject(tree, 'lib', 'a/b');
    const classFilePath = joinPathFragments(root, 'Class.cs');
    tree.write(
      classFilePath,
      `
      namespace ${sourceNamespace}.Foo.Bar;
      public class Class
      {}`,
    );
    const dependentProjectFilePath = 'libs/other/Proj.Other.csproj';
    tree.write(
      dependentProjectFilePath,
      `<Project Sdk="Microsoft.NET.Sdk">
        <ItemGroup>
          <ProjectReference Include="../a/b/${project}/${sourceNamespace}.csproj" />
        </ItemGroup>
      </Project>`,
    );
    const dependentClassFilePath = 'libs/other/Other.cs';
    tree.write(
      dependentClassFilePath,
      `
      namespace Other;
      using ${sourceNamespace}.Foo.Bar;
      public class OtherClass
      {
        System.Console.WriteLine(typeof(Class).FullName);
        System.Console.WriteLine(typeof(${sourceNamespace}.Foo.Bar.Class).FullName);
      }`,
    );
    const nonDependentClassFilePath = 'libs/other2/Other2.cs';
    tree.write(
      nonDependentClassFilePath,
      `
      namespace Other2;
      using ${sourceNamespace}.From.Different.Assembly;
      public class Other2Class
      {
        System.Console.WriteLine(typeof(${sourceNamespace}.From.Different.Assembly.Class).FullName);
      }`,
    );
    const destinationProject = uniq('lib');
    const destination = joinPathFragments('c', 'd', destinationProject);
    const destinationNamespace = `Proj.C.D.${
      names(destinationProject).className
    }`;
    await generator(tree, { projectName: project, destination });
    const destinationRoot = `libs/c/d/${destinationProject}`;
    const destinationClassFilePath = `${destinationRoot}/Class.cs`;
    expect(tree.exists(destinationClassFilePath)).toBeTruthy();
    const destinationClassFile = tree
      .read(destinationClassFilePath)
      ?.toString();
    expect(destinationClassFile).not.toContain(
      `namespace ${sourceNamespace}.Foo.Bar;`,
    );
    expect(destinationClassFile).toContain(
      `namespace ${destinationNamespace}.Foo.Bar;`,
    );
    const dependentClassFile = tree.read(dependentClassFilePath)?.toString();
    expect(dependentClassFile).not.toContain(
      `using ${sourceNamespace}.Foo.Bar;`,
    );
    expect(dependentClassFile).toContain(
      `using ${destinationNamespace}.Foo.Bar;`,
    );
    expect(dependentClassFile).toContain(
      `typeof(${destinationNamespace}.Foo.Bar.Class)`,
    );
    const nonDependentClassFile = tree
      .read(nonDependentClassFilePath)
      ?.toString();
    expect(nonDependentClassFile).toContain(sourceNamespace);
    expect(nonDependentClassFile).not.toContain(destinationNamespace);
  });

  it('should update paths in project configuration', async () => {
    const { project, root: source } = makeSimpleProject(tree, 'app', 'a/b');
    const destination = joinPathFragments('a', 'b', 'c', uniq('app'));
    await generator(tree, { projectName: project, destination });
    const config: ProjectConfiguration & { $schema?: string } =
      readProjectConfiguration(tree, destination.replace(/[\\|/]/g, '-'));
    expect(config).toBeDefined();
    expect(JSON.stringify(config)).not.toContain(source);
    expect(JSON.stringify(config)).toContain(destination);
    expect(config.root.endsWith(destination)).toBeTruthy();
    expect(config.sourceRoot?.startsWith(config.root)).toBeTruthy();
    const relativeToRoot = offsetFromRoot(config.root);
    expect(config.$schema).toMatch(
      new RegExp(`^${joinPathFragments(relativeToRoot, 'node_modules')}.*`),
    );
  });
});

function makeSimpleProject(tree: Tree, type: 'app' | 'lib', path?: string) {
  const project = uniq(type);
  const projectPath = joinPathFragments(path ?? '', project);
  const root = joinPathFragments(`${type}s`, projectPath);
  addProjectConfiguration(tree, project, {
    root,
    sourceRoot: joinPathFragments(root, 'src'),
    projectType: type === 'app' ? 'application' : 'library',
    targets: {
      'my-target': {
        executor: 'nx:noop',
        outputs: [`{workspaceRoot}/dist/${root}`],
      },
    },
  });
  const namespace = getNamespaceFromSchema(tree, projectPath);
  const projectFilePath = joinPathFragments(root, `${namespace}.csproj`);
  tree.write(projectFilePath, 'contents');
  tree.write(joinPathFragments(root, 'readme.md'), 'contents');
  return { project, root, namespace, projectFilePath };
}
