import { execSync } from 'child_process';

import { dotnetFactory } from './dotnet.factory';

jest.mock('child_process', () => ({
  ...jest.requireActual('child_process'),
  execSync: jest.fn(),
}));
const mockExecSync = execSync as jest.MockedFunction<typeof execSync>;
let dotnetVersion = '6.0.100-rc.1.21463.6';

describe('dotnetFactory', () => {
  beforeEach(() => {
    mockExecSync.mockImplementation(() => dotnetVersion);
  });

  it('should be a function', () => {
    expect(dotnetFactory).toBeInstanceOf(Function);
  });

  it('should call dotnet command internally', () => {
    // act
    dotnetFactory();

    // assert
    expect(mockExecSync).toHaveBeenCalledTimes(1);
    expect(mockExecSync).toHaveBeenCalledWith('dotnet --version', {
      encoding: 'utf8',
    });
  });

  it.each(['6.0.100-rc.1.21463.6', '5.0.0.0-rc.1', '3.0.100-rc'])(
    'should return cli information for %s dotnet version',
    (expected) => {
      // arrange
      dotnetVersion = expected;

      // act
      const {
        command,
        info: { global, version },
      } = dotnetFactory();

      // assert
      expect(command).toBe('dotnet');
      expect(global).toBe(true);
      expect(version).toBe(expected);
    },
  );

  it('should throw custom error when dotnet tool is not installed', () => {
    // arrange
    mockExecSync.mockImplementation(() => {
      throw new Error(
        `'dotnet' is not recognized as an internal or external command`,
      );
    });

    // act/assert
    try {
      dotnetFactory();
      fail('should have thrown');
    } catch (error) {
      expect((error as Error).message).toBe(
        'dotnet not installed. Local support not yet added https://github.com/AgentEnder/nx-dotnet/issues/3',
      );
    }
  });
});
