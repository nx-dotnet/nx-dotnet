import { prompt } from 'inquirer';

import { DotNetClient } from '@nx-dotnet/dotnet';

export function promptForTemplate(
  client: DotNetClient,
  search?: string,
  language?: string,
): string | Promise<string> {
  const available = client.listInstalledTemplates({ search, language });

  if (search) {
    const exactMatch = available.find((x) => x.shortNames.includes(search));
    if (exactMatch) {
      return exactMatch.shortNames[0];
    }
  }

  return prompt<{ template: string }>([
    {
      name: 'template',
      type: 'list',
      message:
        'What template should the project be initialized with? (https://docs.microsoft.com/en-us/dotnet/core/tools/dotnet-new#template-options) ',
      choices: available.map((a) => ({
        value: a.shortNames[0],
        message: a.templateName,
      })),
    },
  ]).then((a) => a.template);
}
