import * as rimrafExternal from 'rimraf';

export async function rimraf(path: string) {
  return new Promise<void>((resolve) =>
    rimrafExternal(path, () => {
      resolve();
    })
  );
}
