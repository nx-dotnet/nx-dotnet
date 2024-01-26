import { readJson } from '../../utils';
import { publishAll } from '../publish-all';

import * as parser from 'yargs-parser';

export async function main(version: string) {
  const rootPkg = readJson('package.json');
  const [next, tagSpec]: [string, string | null] = rootPkg.version.startsWith(
    version,
  )
    ? rootPkg.version.split('-')
    : version.split('-');
  let [tag, rev] = tagSpec ? tagSpec.split('.') : ['beta', '0'];
  rev = (parseInt(rev) + 1).toString();
  rev = rev === 'NaN' ? '0' : rev;
  const newVersion = `${next}-${tag}.${rev}`;

  return publishAll(newVersion, tag);
}

if (require.main === module) {
  const { version } = parser(process.argv, {
    string: ['version'],
  }) as parser.Arguments & {
    version: string;
  };
  if (!version) {
    throw new Error('Version is required');
  }
  main(version)
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
