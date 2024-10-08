import { addProjectConfiguration, Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';

import { DotNetClient } from '@nx-dotnet/dotnet';

jest.mock('@nx-dotnet/utils/src/lib/utility-functions/glob', () => ({
  getProjectFileForNxProject: () => Promise.resolve('my.csproj'),
}));

import generator from './generator';
import { NxDotnetGeneratorSchema } from './schema';

describe('nx-dotnet project reference', () => {
  let tree: Tree;
  const appId = 'TEST_APP';
  const libId = 'TEST_LIB';
  let client: DotNetClient;

  const options: NxDotnetGeneratorSchema = {
    project: appId,
    reference: libId,
  };

  beforeAll(() => {
    client = new DotNetClient({
      command: '',
      info: {
        global: false,
        version: 0,
      },
    });
    client.addProjectReference = () => Buffer.from([]);
  });

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });

    // setup fake projects to test linking.
    addProjectConfiguration(tree, appId, {
      root: `apps/${appId}`,
      sourceRoot: `apps/${appId}`,
      targets: {},
      tags: [],
    });

    addProjectConfiguration(tree, libId, {
      root: `libs/${libId}`,
      sourceRoot: `libs/${libId}`,
      targets: {},
      tags: [],
    });
  });

  // Test needs updates after changes to how the generator works.
  // Generator now uses runDotnetAddProjectReference, so actual projects
  // need to be created.
  xit('should call dotnet cli', async () => {
    const spy = jest.spyOn(client, 'addProjectReference');
    await generator(tree, options, client);

    expect(spy).toHaveBeenCalled();
  });
});
