import { prompt } from 'inquirer';

import { ALLOW_MISMATCH } from '@nx-dotnet/utils';

export async function resolveVersionMismatch(
  desired: string | undefined,
  configured: string | undefined,
  allowVersionMismatch: boolean,
  packageName: string | undefined,
): Promise<string> {
  if (configured) {
    if (configured !== desired) {
      if (allowVersionMismatch || configured === ALLOW_MISMATCH) {
        return ALLOW_MISMATCH;
      } else if (!desired) {
        console.log(`Installing with pre-configured version ${configured}`);
        return configured;
      } else {
        const { resolution } = await prompt([
          {
            type: 'list',
            name: 'resolution',
            choices: [
              desired,
              configured,
              {
                name: 'Allow mismatched versions for this package',
                value: ALLOW_MISMATCH,
                short: 'Allow mismatch',
              },
            ],
            message: `There appears to be a mismatch between your current package preferences and the requested version ${
              packageName ? 'for ' + packageName : ''
            }. Which version would you like to use?`,
          },
        ]);
        return resolution;
      }
    }
  } else {
    if (!desired) {
      const { choice } = await prompt([
        {
          name: 'choice',
          message: `You have not yet set a version for ${
            packageName ? packageName : 'this package'
          }. Which version would you like to install?`,
        },
      ]);
      return choice;
    }
  }
  return desired;
}
