import type { ResolvedConfig } from '@nx-dotnet/utils';
import type configUtils = require('@nx-dotnet/utils/src/lib/utility-functions/config');

import * as fs from 'fs';
import {
  getProjectFilePatterns,
  resetProjectFilePatterns,
} from './create-nodes';

let configValues: Partial<ResolvedConfig> = {
  inferProjects: true,
};

jest.mock(
  '@nx-dotnet/utils/src/lib/utility-functions/config',
  () =>
    ({
      readConfig: () => configValues,
    }) as typeof configUtils,
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

describe('getProjectFilePatterns lazy initialization', () => {
  beforeEach(() => {
    // Reset cache before each test
    resetProjectFilePatterns();
    configValues = {
      inferProjects: true,
    };
  });

  it('should return project file patterns when inferProjects is true', () => {
    configValues.inferProjects = true;

    const result = getProjectFilePatterns();

    expect(result).toEqual(['*.csproj', '*.fsproj', '*.vbproj']);
  });

  it('should return empty array when inferProjects is false', () => {
    configValues.inferProjects = false;

    const result = getProjectFilePatterns();

    expect(result).toEqual([]);
  });

  it('should cache the result on subsequent calls', () => {
    configValues.inferProjects = true;

    // First call should read config
    const result1 = getProjectFilePatterns();
    expect(result1).toEqual(['*.csproj', '*.fsproj', '*.vbproj']);

    // Change config value - should still return cached result due to caching
    configValues.inferProjects = false;
    const result2 = getProjectFilePatterns();
    expect(result2).toEqual(['*.csproj', '*.fsproj', '*.vbproj']); // Still cached from first call

    // Results should be the same reference (cached)
    expect(result1).toBe(result2);
  });

  it('should handle undefined inferProjects gracefully', () => {
    delete configValues.inferProjects;

    const result = getProjectFilePatterns();

    expect(result).toEqual([]);
  });
});
