import { Tree } from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';

import { prompt } from 'inquirer';

import { getNxDotnetProjects, updateConfig } from '@nx-dotnet/utils';

import generator from './generator';

import PromptUI = require('inquirer/lib/ui/prompt');

jest.mock('../../../../dotnet/src/lib/core/dotnet.client');
jest.mock('../../../../utils/src/lib/utility-functions/workspace');
jest.mock('inquirer');

describe('sync generator', () => {
  let appTree: Tree;

  beforeEach(() => {
    appTree = createTreeWithEmptyWorkspace();
    updateConfig(appTree, { nugetPackages: {} });

    (prompt as jest.MockedFunction<typeof prompt>)
      .mockReset()
      .mockImplementation((async () => {
        return {};
      }) as () => Promise<unknown> & { ui: PromptUI });

    (getNxDotnetProjects as jest.MockedFunction<typeof getNxDotnetProjects>)
      .mockReset()
      .mockImplementation(() => new Map());
  });

  it('should run successfully', async () => {
    await generator(appTree);
    expect(true).toBeTruthy();
  });
});
