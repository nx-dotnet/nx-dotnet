import { ChildProcess, spawn } from 'child_process';
import { removeSync } from 'fs-extra';
import { join } from 'path';

let verdaccioInstance: ChildProcess;

export function cleanupVerdaccioData() {
  killVerdaccioInstance();
  // Remove previous packages with the same version
  // before publishing the new ones
  removeSync(join(__dirname, '../../../tmp/local-registry'));
}

export function startCleanVerdaccioInstance() {
  cleanupVerdaccioData();
  verdaccioInstance = spawn(
    'npx',
    [
      'verdaccio',
      '--config',
      './tools/scripts/local-registry/config.yml',
      '--listen',
      '4872',
    ],
    {
      cwd: join(__dirname, '../../..'),
      stdio: 'inherit',
    },
  );
}

export function killVerdaccioInstance() {
  if (verdaccioInstance) {
    verdaccioInstance.kill(1);
  }
}

process.on('SIGINT', () => {
  killVerdaccioInstance();
});
