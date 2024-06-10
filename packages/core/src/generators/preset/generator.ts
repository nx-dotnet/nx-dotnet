import { formatFiles, Tree } from '@nx/devkit';
import { DotNetClient, dotnetFactory } from '@nx-dotnet/dotnet';

import appGenerator from '../app/generator';

export default async function (tree: Tree) {
  tree.write('apps/.gitkeep', '');
  tree.write('libs/.gitkeep', '');
  await appGenerator(
    tree,
    {
      language: 'C#',
      template: 'webapi',
      name: 'api',
      testTemplate: 'xunit',
      pathScheme: 'nx',
      skipSwaggerLib: false,
      useOpenApiGenerator: true,
    },
    new DotNetClient(dotnetFactory()),
  );
  await formatFiles(tree);
}
