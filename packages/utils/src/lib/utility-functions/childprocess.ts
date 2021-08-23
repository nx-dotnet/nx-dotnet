/* eslint-disable @typescript-eslint/no-explicit-any */
import * as cp from 'child_process';
import { ChildProcess } from 'child_process';

/**
 * TypeScript typings think ChildProcess is an interface, its a class.
 */
export function isChildProcess(obj: any): obj is cp.ChildProcess {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return obj instanceof cp.ChildProcess;
}

export async function handleChildProcessPassthrough(
  childProcess: ChildProcess,
) {
  let resolver: () => void;

  const exitHandler = async () => {
    console.log('Exit Handler Called');

    if (childProcess) {
      childProcess.kill('SIGINT');
      childProcess.kill('SIGINT');
    }
    process.removeListener('exit', exitHandler);
    process.removeListener('SIGINT', exitHandler);
    process.removeListener('SIGUSR1', exitHandler);
    process.removeListener('SIGUSR2', exitHandler);
    process.removeListener('uncaughtException', exitHandler);
    resolver();
  };

  //do something when app is closing
  process.on('exit', exitHandler);

  //catches ctrl+c event
  process.on('SIGINT', exitHandler);

  // catches "kill pid" (for example: nodemon restart)
  process.on('SIGUSR1', exitHandler);
  process.on('SIGUSR2', exitHandler);

  //catches uncaught exceptions
  process.on('uncaughtException', exitHandler);
}
