import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import {
  Tree,
  readProjectConfiguration,
  addProjectConfiguration,
} from '@nrwl/devkit';

import generator from './generator';
import { NxDotnetGeneratorSchema } from './schema';
import { DotNetClient } from '../../core';

describe('nx-dotnet project reference', () => {
  let appTree: Tree;
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
    appTree = createTreeWithEmptyWorkspace();

    // setup fake projects to test linking.
    addProjectConfiguration(appTree, appId, {
      root: `apps/${appId}`,
      sourceRoot: `apps/${appId}`,
      targets: {},
      tags: [],
    });

    addProjectConfiguration(appTree, libId, {
      root: `libs/${libId}`,
      sourceRoot: `libs/${libId}`,
      targets: {},
      tags: [],
    });
  });

  it('should call dotnet cli', async () => {
    const spy = spyOn(client, 'addProjectReference');
    await generator(appTree, options, client);

    expect(spy).toHaveBeenCalled();
  });

  it('should update dependencies', async () => {
    await generator(appTree, options, client);
    expect(
      readProjectConfiguration(appTree, appId).implicitDependencies
    ).toContain(libId);
  });
});
