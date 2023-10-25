import type { ResolvedConfig } from '@nx-dotnet/utils';
import type configUtils = require('@nx-dotnet/utils/src/lib/utility-functions/config');

import * as fs from 'fs';

let configValues: Partial<ResolvedConfig> = {
  inferProjects: true,
};

jest.mock(
  '@nx-dotnet/utils/src/lib/utility-functions/config',
  () =>
    ({
      readConfig: () => configValues,
    } as typeof configUtils),
);

import { registerProjectTargets } from './create-nodes';

describe('infer-project', () => {
  beforeEach(() => {
    configValues = {
      nugetPackages: {},
      inferredTargets: {
        build: 'build',
        lint: 'lint',
        serve: 'serve',
        test: 'test',
      },
      ignorePaths: [],
      tags: ['nx-dotnet'],
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should obey inferProjectTargets: false', () => {
    configValues.inferredTargets = false;
    jest.spyOn(fs, 'readFileSync').mockReturnValueOnce('<project></project>');

    expect(registerProjectTargets('libs/api/my.csproj')).toEqual({});
  });

  it('should generate build, lint, serve targets for projects', () => {
    jest.spyOn(fs, 'readFileSync').mockReturnValueOnce('<project></project>');

    const targets = registerProjectTargets('libs/api/my.csproj');
    expect(targets.build).toMatchSnapshot();
    expect(targets.lint).toMatchSnapshot();
    expect(targets.serve).toMatchSnapshot();
    expect(targets.test).not.toBeDefined();
  });

  it('should generate test target for test projects', () => {
    jest
      .spyOn(fs, 'readFileSync')
      .mockReturnValueOnce('<project ref=Microsoft.NET.Test.Sdk></project>');

    const targets = registerProjectTargets('libs/api/my.csproj');
    expect(targets.test).toMatchSnapshot();
  });
});
