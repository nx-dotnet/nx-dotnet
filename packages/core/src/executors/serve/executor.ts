import { ExecutorContext } from '@nrwl/devkit';
import {
  getExecutedProjectConfiguration,
  getProjectFileForNxProject,
} from '@nx-dotnet/utils';
import { ServeExecutorSchema } from './schema';

import * as chockidar from 'chokidar';
import { DotNetClient, dotnetFactory, dotnetRunFlags } from '@nx-dotnet/dotnet';
import { ChildProcess } from 'node:child_process';

let resolver: (returnObject: { success: boolean }) => void;
let childProcess: ChildProcess;

export default function dotnetRunExecutor(
  options: ServeExecutorSchema,
  context: ExecutorContext,
  dotnetClient: DotNetClient = new DotNetClient(dotnetFactory())
): Promise<{ success: boolean }> {
  const nxProjectConfiguration = getExecutedProjectConfiguration(context);
  const projectFilePath = getProjectFileForNxProject(nxProjectConfiguration);

  return new Promise((resolve) => {
    resolver = resolve;

    const watcher = chockidar
      .watch(nxProjectConfiguration.root)
      .on('all', () => {
        if (childProcess) {
          childProcess.kill(0);
        }

        dotnetClient.run(
          projectFilePath,
          Object.keys(options).map((x: dotnetRunFlags) => ({
            flag: x,
            value: options[x],
          }))
        );
      });

    console.log(watcher.listeners('all').length)
  });
}

const exitHandler = (options, exitCode = 0) => {
  if (options.cleanup) console.log('clean');
  if (exitCode || exitCode === 0) console.log(exitCode);

  if (childProcess) {
    childProcess.kill(0);
  }
  resolver({
    success: true,
  });

  if (options.exit) process.exit();
};

//do something when app is closing
process.on('exit', () => exitHandler({ cleanup: true }));

//catches ctrl+c event
process.on('SIGINT', () => exitHandler({ exit: true }));

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', () => exitHandler.bind(null, { exit: true }));
process.on('SIGUSR2', () => exitHandler({ exit: true }));

//catches uncaught exceptions
process.on('uncaughtException', () => exitHandler({ exit: true }));
