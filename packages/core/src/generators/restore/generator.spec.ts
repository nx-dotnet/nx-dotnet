import { Tree, updateNxJson } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';

import {
  getNxDotnetProjects,
  getProjectFilesForProject,
  updateConfig,
} from '@nx-dotnet/utils';
import { DotNetClient, mockDotnetFactory } from '@nx-dotnet/dotnet';

import generator from './generator';

jest.mock('../../../../dotnet/src/lib/core/dotnet.client');
jest.mock('../../../../utils/src/lib/utility-functions/workspace');

describe('restore generator', () => {
  let tree: Tree;
  let dotnetClient: jest.Mocked<DotNetClient>;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
    tree.write('Test.sln', '');
    dotnetClient = new DotNetClient(
      mockDotnetFactory(),
    ) as jest.Mocked<DotNetClient>;
    updateNxJson(tree, {
      plugins: ['@nx-dotnet/core'],
    });
    updateConfig(tree, {
      nugetPackages: {},
      solutionFile: 'Test.sln',
    });

    (getNxDotnetProjects as jest.MockedFunction<typeof getNxDotnetProjects>)
      .mockReset()
      .mockImplementation(() =>
        Promise.resolve(
          new Map([
            ['app-project', { root: 'apps/project' }],
            ['lib-project2', { root: 'libs/project2' }],
            ['lib-solutionless-project', { root: 'libs/solutionless-project' }],
          ]),
        ),
      );

    (
      getProjectFilesForProject as jest.MockedFunction<
        typeof getProjectFilesForProject
      >
    )
      .mockReset()
      .mockImplementation((_tree, _project, projectName) => {
        if (projectName === 'app-project') {
          return ['apps/project/Project.csproj'];
        }
        if (projectName === 'lib-project2') {
          return ['libs/project2/Project2.fsproj'];
        }
        if (projectName === 'lib-solutionless-project') {
          return ['libs/solutionless-project/Project.csproj'];
        }
        throw new Error(`Unexpected project name: ${projectName}`);
      });
    dotnetClient.getProjectsInSolution.mockReturnValue([
      'apps/project/Project.csproj',
      'libs/project2/Project2.fsproj',
    ]);
  });

  it('should restore each project if not using a solution file', async () => {
    updateConfig(tree, {
      nugetPackages: {},
    });
    await generator(tree, { solutionFile: true }, dotnetClient);
    expect(dotnetClient.getProjectsInSolution).not.toBeCalled();
    expect(dotnetClient.restorePackages).toHaveBeenCalledWith(
      'apps/project/Project.csproj',
    );
    expect(dotnetClient.restorePackages).toHaveBeenCalledWith(
      'libs/project2/Project2.fsproj',
    );
    expect(dotnetClient.restorePackages).toHaveBeenCalledWith(
      'libs/solutionless-project/Project.csproj',
    );
    expect(dotnetClient.restorePackages).toHaveBeenCalledTimes(3);
    expect(dotnetClient.restoreTools).toHaveBeenCalled();
  });

  it('should restore solution if exists, then any projects not in solution', async () => {
    await generator(tree, { solutionFile: true }, dotnetClient);
    expect(dotnetClient.restorePackages).toHaveBeenCalledWith('Test.sln');
    expect(dotnetClient.getProjectsInSolution).toBeCalledWith('Test.sln');
    expect(dotnetClient.restorePackages).toHaveBeenCalledWith(
      'libs/solutionless-project/Project.csproj',
    );
    expect(dotnetClient.restorePackages).toHaveBeenCalledTimes(2);
    expect(dotnetClient.restoreTools).toHaveBeenCalled();
  });

  it('should not use solution fire if configured to', async () => {
    await generator(tree, { solutionFile: false }, dotnetClient);
    expect(dotnetClient.restorePackages).not.toHaveBeenCalledWith('Test.sln');
    expect(dotnetClient.restorePackages).toHaveBeenCalledTimes(3);
  });

  it('should restore using provided solution file', async () => {
    tree.write('specific-solution.sln', '');
    await generator(
      tree,
      { solutionFile: 'specific-solution.sln' },
      dotnetClient,
    );
    expect(dotnetClient.restorePackages).toHaveBeenCalledWith(
      'specific-solution.sln',
    );
    expect(dotnetClient.getProjectsInSolution).toBeCalledWith(
      'specific-solution.sln',
    );
  });
});
