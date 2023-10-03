import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import {
  Tree,
  readProjectConfiguration,
  addProjectConfiguration,
  joinPathFragments,
  names,
  offsetFromRoot,
  ProjectConfiguration,
} from '@nrwl/devkit';
import { uniq } from '@nrwl/nx-plugin/testing';

import generator from './generator';
import { basename } from 'path';

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

  it('should update references in .csproj files', async () => {
    const { project, root } = makeSimpleProject(tree, 'app', 'test');
    const csProjPath = 'apps/other/Other.csproj';
    tree.write(
      csProjPath,
      `<Project Sdk="Microsoft.NET.Sdk">
    <ItemGroup>
      <ProjectReference Include="../test/${project}/${
        names(project).className
      }.csproj" />
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
    const destination = joinPathFragments(uniq('app'));
    console.log(tree.read(csProjPath)?.toString());
    await generator(tree, { projectName: project, destination });
    const config = readProjectConfiguration(
      tree,
      destination.replace(/[\\|/]/g, '-'),
    );
    expect(config).toBeDefined();
    expect(tree.exists(`apps/${destination}/readme.md`)).toBeTruthy();
    expect(tree.exists(`apps/test/readme.md`)).toBeFalsy();
    const updatedCsProj = tree.read(csProjPath)?.toString();
    expect(updatedCsProj).not.toContain(root);
    expect(updatedCsProj).not.toContain(project);
    expect(updatedCsProj).toContain(basename(destination));
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
  const root = joinPathFragments(`${type}s`, path ?? '', project);
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
  tree.write(joinPathFragments(root, 'readme.md'), 'contents');
  return { project, root };
}
