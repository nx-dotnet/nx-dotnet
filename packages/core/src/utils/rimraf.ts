import * as rimrafExternal from 'rimraf';

export async function rimraf(path) {
  return new Promise<void>((resolve) =>
    rimrafExternal(path, () => {
      resolve();
    })
  );
}
