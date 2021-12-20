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

export function startCleanVerdaccioInstance(): Promise<void> {
  cleanupVerdaccioData();
  let ready: () => void;
  verdaccioInstance = spawn(
    process.platform === 'win32' ? 'npx.cmd' : 'npx',
    [
      'verdaccio',
      '--config',
      './tools/scripts/local-registry/config.yml',
      '--listen',
      '4872',
    ],
    {
      cwd: join(__dirname, '../../..'),
      stdio: 'pipe',
    },
  );
  verdaccioInstance.stderr?.pipe(verdaccioInstance.stdout as any);
  verdaccioInstance.stdout?.on('data', (m) => {
    console.log(m.toString());
    if (m.toString().includes('http://localhost:4872/')) {
      ready();
    }
  });
  return new Promise((resolve) => {
    ready = resolve;
  });
}

export function killVerdaccioInstance() {
  if (verdaccioInstance) {
    verdaccioInstance.kill(1);
  }
}

process.on('SIGINT', () => {
  killVerdaccioInstance();
});
