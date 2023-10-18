import { Tree, updateNxJson } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';

import { Answers, prompt } from 'inquirer';

import { getNxDotnetProjects, updateConfig } from '@nx-dotnet/utils';

import generator from './generator';

import PromptUI = require('inquirer/lib/ui/prompt');

jest.mock('../../../../dotnet/src/lib/core/dotnet.client');
jest.mock('../../../../utils/src/lib/utility-functions/workspace');
jest.mock('inquirer');

describe('sync generator', () => {
  let appTree: Tree;

  beforeEach(() => {
    appTree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
    updateNxJson(appTree, {
      plugins: ['@nx-dotnet/core'],
    });
    updateConfig(appTree, { nugetPackages: {} });

    (prompt as jest.MockedFunction<typeof prompt>)
      .mockReset()
      .mockImplementation((async () => {
        return {};
      }) as () => Promise<Answers> & { ui: PromptUI });

    (getNxDotnetProjects as jest.MockedFunction<typeof getNxDotnetProjects>)
      .mockReset()
      .mockImplementation(() => Promise.resolve(new Map()));
  });

  it('should run successfully', async () => {
    await generator(appTree);
    expect(true).toBeTruthy();
  });
});
