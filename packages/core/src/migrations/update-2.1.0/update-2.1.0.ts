import {
  isNxDotnetConfigV1,
  readConfigFromNxJson,
  readConfigFromRCFile,
  updateConfig,
  upgradeConfigToV2,
} from '@nx-dotnet/utils';
import { NX_VERSION, Tree } from '@nx/devkit';
import { major } from 'semver';

export default function update(host: Tree) {
  if (major(NX_VERSION) >= 17) {
    const options = readConfigFromNxJson(host);
    if (!options) {
      return;
    }
    if (isNxDotnetConfigV1(options)) {
      updateConfig(host, upgradeConfigToV2(options));
    }
  } else {
    const options = readConfigFromRCFile(host);
    if (isNxDotnetConfigV1(options)) {
      updateConfig(host, upgradeConfigToV2(options));
    }
  }
}
