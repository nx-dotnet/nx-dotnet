import {
  readDotnetToolsManifest,
  readInstalledDotnetToolVersion,
} from './dotnet-tools-manifest';
import * as devkit from '@nrwl/devkit';
import * as fs from 'fs';

const root = '/virtual';
jest.mock('@nrwl/devkit', () => ({
  ...jest.requireActual('@nrwl/devkit'),
  workspaceRoot: '/virtual',
}));

const existsSyncMock = jest.spyOn(fs, 'existsSync');
const readJsonFileMock = jest.spyOn(devkit, 'readJsonFile');

describe('dotnet tools util functions', () => {
  describe('readDotnetToolsManifest', () => {
    beforeEach(() => {
      existsSyncMock.mockReset();
      readJsonFileMock.mockReset();
      existsSyncMock.mockReturnValue(true);
      readJsonFileMock.mockImplementation((p: string): object => {
        if (p === `${root}/.config/dotnet-tools.json`) {
          return {
            version: 1,
            isRoot: true,
            tools: {
              'swashbuckle.aspnetcore.cli': {
                version: '99.99.99',
                commands: ['swagger'],
              },
            },
          };
        }
        throw new Error(`Attempted to read unexpected file: ${p}`);
      });
    });

    it('should read from workspace root', async () => {
      const result = readDotnetToolsManifest();
      expect(result).toEqual({
        version: 1,
        isRoot: true,
        tools: {
          'swashbuckle.aspnetcore.cli': {
            version: '99.99.99',
            commands: ['swagger'],
          },
        },
      });
    });

    it('should return undefined if file missing', async () => {
      existsSyncMock.mockReturnValue(false);
      const result = readDotnetToolsManifest();
      expect(result).toBeUndefined();
      expect(readJsonFileMock).not.toHaveBeenCalled();
    });

    it('should return undefined if file wrong version', async () => {
      readJsonFileMock.mockImplementation((p: string): object => {
        if (p === `${root}/.config/dotnet-tools.json`) {
          return {
            version: 99,
            isRoot: true,
            tools: {},
          };
        }
        throw new Error(`Attempted to read unexpected file: ${p}`);
      });
      const result = readDotnetToolsManifest();
      expect(result).toBeUndefined();
    });

    it('read from overridden file path if provided', async () => {
      readJsonFileMock.mockImplementation((p: string): object => {
        if (p === '/custom/path/file.json') {
          return {
            version: 1,
            isRoot: true,
            tools: {},
          };
        }
        throw new Error(`Attempted to read unexpected file: ${p}`);
      });
      const result = readDotnetToolsManifest('/custom/path/file.json');
      expect(result).toEqual({
        version: 1,
        isRoot: true,
        tools: {},
      });
    });
  });

  describe('readInstalledDotnetToolVersion', () => {
    beforeEach(() => {
      existsSyncMock.mockReturnValue(true);
      readJsonFileMock.mockImplementation((p: string): object => {
        if (p === `${root}/.config/dotnet-tools.json`) {
          return {
            version: 1,
            isRoot: true,
            tools: {
              'swashbuckle.aspnetcore.cli': {
                version: '99.99.99',
                commands: ['swagger'],
              },
            },
          };
        }
        throw new Error(`Attempted to read unexpected file: ${p}`);
      });
    });

    it('should read version', async () => {
      const result = readInstalledDotnetToolVersion(
        'swashbuckle.aspnetcore.cli',
      );
      expect(result).toEqual('99.99.99');
    });

    it('should read version if tool case mismatch', async () => {
      const result = readInstalledDotnetToolVersion(
        'SwashBuckle.AspNetCore.Cli',
      );
      expect(result).toEqual('99.99.99');
    });

    it('should return undefined if tool not installed', async () => {
      const result = readInstalledDotnetToolVersion('Not.There');
      expect(result).toBeUndefined();
    });

    it('should return undefined if no tool manifest file', async () => {
      existsSyncMock.mockReturnValue(false);
      const result = readInstalledDotnetToolVersion(
        'swashbuckle.aspnetcore.cli',
      );
      expect(result).toBeUndefined();
    });
  });
});
