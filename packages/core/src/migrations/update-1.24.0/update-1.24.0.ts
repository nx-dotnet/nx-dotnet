/* eslint-disable @typescript-eslint/no-unused-vars */
import { NX_VERSION, Tree, output } from '@nx/devkit';

import moveConfigToNxJson from '../../generators/nxjson-config/generator';
import { major } from 'semver';

export default function update(host: Tree) {
  if (major(NX_VERSION) < 17) {
    output.warn({
      title: 'Skipping migration of nx-dotnet config.',
      bodyLines: [
        'Nx 17 added standardized support for plugins to supply configuration options within nx.json. This migration would have moved your nx-dotnet config to nx.json, but you are using an older version of Nx.',
        'After updating Nx, you can apply this migration by either running:',
        '- nx g @nx-dotnet/core:nxjson-config',
        '- nx migrate @nx-dotnet/core@1.24.0 --from 1.23.0',
      ],
    });
  } else {
    moveConfigToNxJson(host);
  }
}
