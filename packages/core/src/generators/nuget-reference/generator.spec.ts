import { createTree, createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import { Tree, readProjectConfiguration } from '@nrwl/devkit';

import generator from './generator';
import { NugetReferenceGeneratorSchema } from './schema';
import { rimraf } from '@nx-dotnet/utils';
import { DotNetClient, mockDotnetFactory } from '@nx-dotnet/dotnet';

jest.mock('../../../../dotnet/src/lib/core/dotnet.client');
jest.mock('../../../../utils/src/lib/workspace');

describe('nuget-reference generator', () => {
  let appTree: Tree;

  const options: NugetReferenceGeneratorSchema = {
    packageName: 'test',
    project: 'test',
  };

  let dotnetClient: DotNetClient;

  beforeEach(() => {
    appTree = createTreeWithEmptyWorkspace();
    appTree.write(
      'workspace.json',
      JSON.stringify({
        projects: {
          test: {},
        },
      })
    );
    appTree.write(
      'nx.json',
      JSON.stringify({
        projects: {
          test: {
            tags: [],
          },
        },
      })
    );

    dotnetClient = new DotNetClient(mockDotnetFactory());
  });

  it('runs calls dotnet add package reference', async () => {
    const output = await generator(appTree, options, dotnetClient);
    expect(output.success).toBe(true);
    const mock = dotnetClient as jest.Mocked<DotNetClient>;
    expect(mock.addPackageReference).toHaveBeenCalledTimes(1);
  });
});
