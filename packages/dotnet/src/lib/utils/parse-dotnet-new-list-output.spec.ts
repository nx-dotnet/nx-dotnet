import { DotnetTemplate } from '../models';
import { parseDotnetNewListOutput } from './parse-dotnet-new-list-output';

const TEST_CASES: [string[], DotnetTemplate[]][] = [
  [
    [
      `Search for 'ASP.NET':`,
      ``,
      `Templates            Short Name       Language`,
      `---------------      -----------      ------------`,
      `ASP.NET Core         aspnetcore       C#`,
    ],
    [
      {
        shortNames: ['aspnetcore'],
        templateName: 'ASP.NET Core',
        languages: ['C#'],
      },
    ],
  ],
  [
    [
      `Template Name                                 Short Name           Language    Tags`,
      `--------------------------------------------  -------------------  ----------  -------------------------------------`,
      `ASP.NET Core Empty                            web                  [C#],F#     Web/Empty`,
    ],
    [
      {
        shortNames: ['web'],
        templateName: 'ASP.NET Core Empty',
        languages: ['C#', 'F#'],
        tags: ['Web', 'Empty'],
      },
    ],
  ],
  [
    [
      `Ces modèles correspondent à votre entrée : .`,
      ``,
      `Nom du modèle                                 Nom court       Langue      Balises                   `,
      `--------------------------------------------  --------------  ----------  --------------------------`,
      `ASP.NET Core Empty                            web             [C#],F#     Web/Empty  `,
    ],
    [
      {
        shortNames: ['web'],
        templateName: 'ASP.NET Core Empty',
        languages: ['C#', 'F#'],
        tags: ['Web', 'Empty'],
      },
    ],
  ],
  [
    [
      `Template Name                                 Short Name           Language    Tags`,
      `--------------------------------------------  -------------------  ----------  -------------------------------------`,
      `ASP.NET Core Web App                          razor,webapp         [C#]        Web/MVC/Razor Pages`,
      `ASP.NET Core Web App (Model-View-Controller)  mvc                  [C#],F#     Web/MVC`,
      `ASP.NET Core with Angular                     angular              [C#]        Web/MVC/SPA`,
    ],
    [
      {
        shortNames: ['razor', 'webapp'],
        templateName: 'ASP.NET Core Web App',
        languages: ['C#'],
        tags: ['Web', 'MVC', 'Razor Pages'],
      },
      {
        shortNames: ['mvc'],
        templateName: 'ASP.NET Core Web App (Model-View-Controller)',
        languages: ['C#', 'F#'],
        tags: ['Web', 'MVC'],
      },
      {
        shortNames: ['angular'],
        templateName: 'ASP.NET Core with Angular',
        languages: ['C#'],
        tags: ['Web', 'MVC', 'SPA'],
      },
    ],
  ],
];

describe('parseDotnetNewListOutput', () => {
  it.each(TEST_CASES)('should handle test case %#', (raw, parsed) => {
    expect(parseDotnetNewListOutput(raw.join('\n'))).toEqual(parsed);
  });
});
