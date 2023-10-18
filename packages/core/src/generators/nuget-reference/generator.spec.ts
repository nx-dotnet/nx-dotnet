import { addProjectConfiguration, Tree, updateNxJson } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';

import { Answers, prompt } from 'inquirer';

import { DotNetClient, mockDotnetFactory } from '@nx-dotnet/dotnet';
import { updateConfig, getProjectFileForNxProject } from '@nx-dotnet/utils';

import generator from './generator';
import { NugetReferenceGeneratorSchema } from './schema';

import PromptUI = require('inquirer/lib/ui/prompt');

jest.mock('../../../../dotnet/src/lib/core/dotnet.client');
jest.mock('../../../../utils/src/lib/utility-functions/workspace');
jest.mock('inquirer');

describe('nuget-reference generator', () => {
  let tree: Tree;

  const options: NugetReferenceGeneratorSchema = {
    packageName: 'test',
    project: 'test',
    allowVersionMismatch: false,
  };

  let dotnetClient: DotNetClient;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
    updateNxJson(tree, {
      plugins: ['@nx-dotnet/core'],
    });
    addProjectConfiguration(tree, 'test', {
      root: 'libs/test',
    });

    updateConfig(tree, { nugetPackages: {} });
    (prompt as jest.MockedFunction<typeof prompt>)
      .mockReset()
      .mockImplementation((async () => {
        return {};
      }) as () => Promise<Answers> & { ui: PromptUI });

    dotnetClient = new DotNetClient(mockDotnetFactory());
  });

  it('runs calls dotnet add package reference', async () => {
    await generator(tree, options, dotnetClient);
    const mock = dotnetClient as jest.Mocked<DotNetClient>;
    expect(mock.addPackageReference).toHaveBeenCalledTimes(1);
  });

  it('only prompts user once on version mismatch / miss', async () => {
    await generator(tree, options, dotnetClient);
    expect(prompt).toHaveBeenCalledTimes(1);
  });

  it('provides resolved version to dotnet add package reference', async () => {
    const projectFilePath = 'libs/test/Test.csproj';

    (getProjectFileForNxProject as jest.MockedFunction<() => Promise<string>>)
      .mockReset()
      .mockResolvedValue(projectFilePath);

    updateConfig(tree, {
      nugetPackages: { [options.packageName]: '1.2.3' },
    });
    await generator(tree, options, dotnetClient);
    const mock = dotnetClient as jest.Mocked<DotNetClient>;
    expect(mock.addPackageReference).toHaveBeenCalledWith(
      projectFilePath,
      options.packageName,
      { version: '1.2.3' },
    );
  });
});
