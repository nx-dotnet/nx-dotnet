import { DotNetClient } from './dotnet.client';
import { dotnetFactory, mockDotnetFactory } from './dotnet.factory';
import * as cp from 'child_process';

describe('dotnet client', () => {
  describe('publish', () => {
    describe('extra parameters', () => {
      const dotnetClient = new DotNetClient(mockDotnetFactory());

      let spawnSyncSpy: jest.SpyInstance;

      beforeEach(() => {
        spawnSyncSpy = jest
          .spyOn(cp, 'spawnSync')
          .mockReturnValue({ status: 0 } as Partial<
            cp.SpawnSyncReturns<Buffer>
          > as cp.SpawnSyncReturns<Buffer>);
      });

      afterEach(() => {
        jest.resetAllMocks();
      });

      it('should handle multiple parameters', () => {
        dotnetClient.publish(
          'my-project',
          undefined,
          undefined,
          '--flag --other-flag',
        );
        expect(spawnSyncSpy.mock.calls[0][1]).toContain('--flag');
        expect(spawnSyncSpy.mock.calls[0][1]).toContain('--other-flag');
        expect(spawnSyncSpy).toHaveBeenCalledTimes(1);
      });

      it('should handle multiple parameters with quotations', () => {
        dotnetClient.publish(
          'my-project',
          undefined,
          undefined,
          `--flag \\p:"my project"`,
        );
        expect(spawnSyncSpy.mock.calls[0][1]).toContain('--flag');
        expect(spawnSyncSpy.mock.calls[0][1]).toContain('\\p:"my project"');
        expect(spawnSyncSpy).toHaveBeenCalledTimes(1);
      });

      it('should handle several parameters', () => {
        dotnetClient.publish(
          'my-project',
          undefined,
          undefined,
          `--self-contained=false /p:CopyOutputSymbolsToPublishDirectory=false /p:Version=2022.03.25.1 /p:VersionAssembly=2022.03.25.1 /p:Name:"My Project"`,
        );
        expect(spawnSyncSpy.mock.calls[0][1]).toMatchInlineSnapshot(`
          Array [
            "publish",
            "\\"my-project\\"",
            "--self-contained=false",
            "/p:CopyOutputSymbolsToPublishDirectory=false",
            "/p:Version=2022.03.25.1",
            "/p:VersionAssembly=2022.03.25.1",
            "/p:Name:\\"My Project\\"",
          ]
        `);
        expect(spawnSyncSpy).toHaveBeenCalledTimes(1);
      });

      it('should expand environment variables', () => {
        process.env.FOO = 'bar';
        dotnetClient.publish(
          'my-project',
          undefined,
          undefined,
          '-p:Name=$FOO',
        );
        expect(spawnSyncSpy.mock.calls[0][1]).toContain('-p:Name=bar');
      });
    });
  });

  describe('listInstalledTemplates', () => {
    it('should list default templates', () => {
      const client = new DotNetClient(dotnetFactory());
      const results = client
        .listInstalledTemplates()
        .flatMap((x) => x.shortNames);
      expect(results).toContain('webapi');
      expect(results).toContain('console');
      expect(results).toContain('webapp');
    });

    it('should filter by search', () => {
      const client = new DotNetClient(dotnetFactory());
      const results = client.listInstalledTemplates({ search: 'asp' });
      for (const result of results) {
        expect(result.templateName).toMatch(/^asp.*/i);
      }
    });

    it('should filter by language', () => {
      const client = new DotNetClient(dotnetFactory());
      const results = client.listInstalledTemplates({ language: 'C#' });
      for (const result of results) {
        expect(result.languages).toContain('C#');
      }
    });
  });
});
