import * as fs from 'fs';

import * as config from '@nx-dotnet/utils/src/lib/utility-functions/config';

import { registerProjectTargets } from './infer-project';

describe('infer-project', () => {
  it('should obey inferProjectTargets: false', () => {
    jest.spyOn(config, 'readConfig').mockReturnValue({
      nugetPackages: {},
      inferProjectTargets: false,
    });
    jest.spyOn(fs, 'readFileSync').mockReturnValueOnce('<project></project>');

    expect(registerProjectTargets('libs/api/my.csproj')).toEqual({});
  });

  it('should generate build, lint, serve targets for projects', async () => {
    jest.spyOn(config, 'readConfig').mockReturnValue({
      nugetPackages: {},
    });
    jest.spyOn(fs, 'readFileSync').mockReturnValueOnce('<project></project>');

    const targets = registerProjectTargets('libs/api/my.csproj');
    console.log(targets);
    expect(targets.build).toMatchInlineSnapshot(`
      Object {
        "configurations": Object {
          "production": Object {
            "configuration": "Release",
          },
        },
        "executor": "@nx-dotnet/core:build",
        "options": Object {
          "configuration": "Debug",
          "noDependencies": true,
        },
        "outputs": Array [
          "dist/libs/api",
        ],
      }
    `);
    expect(targets.lint).toMatchInlineSnapshot(`
      Object {
        "executor": "@nx-dotnet/core:format",
      }
    `);
    expect(targets.serve).toMatchInlineSnapshot(`
      Object {
        "configurations": Object {
          "production": Object {
            "configuration": "Release",
          },
        },
        "executor": "@nx-dotnet/core:serve",
        "options": Object {
          "configuration": "Debug",
        },
      }
    `);
    expect(targets.test).not.toBeDefined();
  });

  it('should generate test target for test projects', async () => {
    jest.spyOn(config, 'readConfig').mockReturnValue({
      nugetPackages: {},
    });
    jest
      .spyOn(fs, 'readFileSync')
      .mockReturnValueOnce('<project ref=Microsoft.NET.Test.Sdk></project>');

    const targets = registerProjectTargets('libs/api/my.csproj');
    console.log(targets);
    expect(targets.test).toMatchInlineSnapshot(`
      Object {
        "executor": "@nx-dotnet/core:test",
        "options": Object {
          "testProject": undefined,
        },
      }
    `);
  });
});
