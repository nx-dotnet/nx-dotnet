import { Tree } from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';

import { prompt } from 'inquirer';

import { DotNetClient, dotnetFactory } from '@nx-dotnet/dotnet';
import { updateConfig } from '@nx-dotnet/utils';

import generator from './generator';
import { NugetReferenceGeneratorSchema } from './schema';

import PromptUI = require('inquirer/lib/ui/prompt');

jest.mock('../../../../utils/src/lib/utility-functions/workspace');
jest.mock('inquirer');

describe('nuget-reference generator', () => {
  let appTree: Tree;

  const options: NugetReferenceGeneratorSchema = {
    packageName: 'test',
    project: 'test',
    allowVersionMismatch: false,
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
      }),
    );
    appTree.write(
      'nx.json',
      JSON.stringify({
        projects: {
          test: {
            tags: [],
          },
        },
      }),
    );

    updateConfig(appTree, { nugetPackages: {} });
    (prompt as jest.MockedFunction<typeof prompt>)
      .mockReset()
      .mockImplementation((async () => {
        return {};
      }) as () => Promise<unknown> & { ui: PromptUI });

    dotnetClient = new DotNetClient(dotnetFactory());
  });

  it('runs calls dotnet add package reference', async () => {
    await generator(appTree, options, dotnetClient);
    const mock = dotnetClient as jest.Mocked<DotNetClient>;
    expect(mock.addPackageReference).toHaveBeenCalledTimes(1);
  });

  it('only prompts user once on version mismatch / miss', async () => {
    await generator(appTree, options, dotnetClient);
    expect(prompt).toHaveBeenCalledTimes(1);
  });
});
