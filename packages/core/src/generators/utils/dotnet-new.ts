import { DotNetClient, DotnetNewOptions } from '@nx-dotnet/dotnet';
import { Tree, joinPathFragments } from '@nx/devkit';
import { readFileSync, readdirSync, rmSync } from 'fs';
import { join } from 'path';

import { dirSync } from 'tmp';

export function runDotnetNew(
  tree: Tree,
  dotnetClient: DotNetClient,
  template: string,
  dotnetNewOptions: DotnetNewOptions,
  additionalArguments?: string[],
) {
  const { name: tmpDir } = dirSync();
  const { output, ...otherOptions } = dotnetNewOptions;
  dotnetClient.new(
    template,
    {
      ...otherOptions,
      output: tmpDir,
    },
    additionalArguments,
  );
  copyFilesToTree(tree, tmpDir, typeof output === 'string' ? output : '.');
  rmSync(tmpDir, { recursive: true });
}

export function copyFilesToTree(tree: Tree, dir: string, dest: string) {
  const children = readdirSync(dir, { withFileTypes: true });
  for (const child of children) {
    if (child.isDirectory()) {
      copyFilesToTree(
        tree,
        join(dir, child.name),
        joinPathFragments(dest, child.name),
      );
    } else {
      tree.write(
        joinPathFragments(dest, child.name),
        readFileSync(join(dir, child.name)),
      );
    }
  }
}
