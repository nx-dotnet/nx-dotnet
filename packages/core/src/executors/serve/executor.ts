import { ExecutorContext } from '@nrwl/devkit';

import { ChildProcess } from 'child_process';
import * as chockidar from 'chokidar';

import { DotNetClient, dotnetFactory, dotnetRunFlags } from '@nx-dotnet/dotnet';
import {
    getDependantProjectsForNxProject, getExecutedProjectConfiguration, getProjectFileForNxProject,
    rimraf
} from '@nx-dotnet/utils';

import { ServeExecutorSchema } from './schema';

let resolver: (returnObject: { success: boolean }) => void;
let childProcess: ChildProcess;
let timeout: NodeJS.Timeout;
let projectDirectory: string;

export default function dotnetRunExecutor(
  options: ServeExecutorSchema,
  context: ExecutorContext,
  dotnetClient: DotNetClient = new DotNetClient(dotnetFactory())
): Promise<{ success: boolean }> {
  const nxProjectConfiguration = getExecutedProjectConfiguration(context);
  
  return getProjectFileForNxProject(nxProjectConfiguration).then((project) => {
    projectDirectory = nxProjectConfiguration.root;
    
    return new Promise((resolve) => {
      resolver = resolve;

      const watcher = chockidar
        .watch(nxProjectConfiguration.root);

      getDependantProjectsForNxProject(context.projectName, context.workspace, (dependency) => {
        watcher.add(dependency.root)
      });
      
      watcher
        .on('all', (event, path) => {
          if (path.includes('bin') || path.includes('obj')) {
            return;
          }

          if (timeout) {
            clearTimeout(timeout);
          }

          timeout = setTimeout(() => {
            setupDotnetRun(dotnetClient, project, options);
          }, 1000)

          console.log(event, path)
        });
    });
  });
}

const setupDotnetRun = (dotnetClient, project, options) => {
  if (childProcess) {
    childProcess.kill('SIGTERM');
  }

  childProcess = dotnetClient.run(
    project,
    Object.keys(options).map((x: dotnetRunFlags) => ({
      flag: x,
      value: options[x],
    }))
  );

  childProcess.on('error', (err) => {
    console.error(err);
  })
}

const exitHandler = async (options, exitCode = 0) => {
  console.log('Exit Handler Called');

  await rimraf(projectDirectory + '/bin')
  await rimraf(projectDirectory + '/obj')

  if (options.cleanup) console.log('clean');
  if (exitCode || exitCode === 0) console.log(exitCode);

  if (childProcess) {
    childProcess.kill('SIGINT');
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
process.on('SIGUSR1', () => exitHandler({ exit: true }));
process.on('SIGUSR2', () => exitHandler({ exit: true }));

//catches uncaught exceptions
process.on('uncaughtException', () => exitHandler({ exit: true }));
