/// <reference types="jest" />
import { DotnetFactory } from '@nx-dotnet/dotnet';

const dotnetFactory: DotnetFactory = () => ({
  command: 'echo',
  info: {
    global: true,
    version: 0,
  },
});

const DotNetClient = jest.fn().mockImplementation(() => ({
  cwd: '',
  addPackageReference: jest.fn(),
  build: jest.fn(),
  format: jest.fn(),
  installTool: jest.fn(),
  new: jest.fn(),
  printSdkVersion: jest.fn(),
  publish: jest.fn(),
  restoreTools: jest.fn(),
  test: jest.fn(),
}));

export { dotnetFactory, DotNetClient };
