import {
  Tree,
  formatFiles,
  installPackagesTask,
  joinPathFragments,
  logger,
  generateFiles,
  names,
} from '@nx/devkit';
import { XmlDocument } from 'xmldoc';
import { join } from 'path';

const KeyPropertyMap: Record<string, string> = {
  ColumnNameLanguage: 'languages',
  ColumnNameTags: 'tags',
  ColumnNameShortName: 'shortNames',
  ColumnNameTemplateName: 'templateName',
  Templates: 'templateName',
};

const outputDirectory = joinPathFragments(
  'packages/dotnet/src/lib/utils/language-mappings',
);

type Translation = {
  key: string;
  localizedName?: string;
};

export default async function (tree: Tree) {
  const { default: fetch } =
    await dynamicImport<typeof import('node-fetch')>('node-fetch');
  const enXml = await fetch(
    `https://api.github.com/repos/dotnet/sdk/contents/src/Cli/Microsoft.TemplateEngine.Cli/LocalizableStrings.resx?ref=main`,
  )
    .then((x) => x.json())
    .then((x: unknown) =>
      typeof x === 'object' &&
      x &&
      'content' in x &&
      typeof x.content === 'string'
        ? Buffer.from(x.content, 'base64').toString()
        : null,
    );

  if (!enXml) {
    throw new Error('Unable to fetch English translation file');
  }

  const translationDirectoryContents = (await fetch(
    `https://api.github.com/repos/dotnet/sdk/contents/src/Cli/Microsoft.TemplateEngine.Cli/xlf`,
  ).then((x) => x.json())) as { path: string; download_url: string }[];
  const translations: { lang: string; pairs: Translation[] }[] = [
    {
      lang: 'en',
      pairs: getEnTranslations(new XmlDocument(enXml)),
    },
  ];

  const regexp = /LocalizableStrings\.(?<lang>.*)\.xlf/;

  for (const translationFile of translationDirectoryContents) {
    const language = translationFile.path.match(regexp)?.groups?.lang;
    if (language) {
      const langXml = await fetch(translationFile.download_url).then((x) =>
        x.text(),
      );
      translations.push({
        lang: language,
        pairs: getTranslationsFromXlf(new XmlDocument(langXml)),
      });
    } else {
      logger.warn(
        `Unable to determine language for translation: ${translationFile.path}`,
      );
    }
  }

  const languages: (ReturnType<typeof names> & { raw: string })[] = [];
  for (const translation of translations) {
    console.log('Updated language mappings for', translation.lang);
    generateFiles(tree, join(__dirname, 'files'), outputDirectory, {
      tmpl: '',
      language: translation.lang,
      pairs: translation.pairs,
      KeyPropertyMap,
    });
    languages.push({ ...names(translation.lang), raw: translation.lang });
  }
  generateFiles(tree, join(__dirname, 'index-template'), outputDirectory, {
    tmpl: '',
    languages,
  });

  await formatFiles(tree);
  return () => {
    installPackagesTask(tree);
  };
}

function getEnTranslations(xml: XmlDocument): Translation[] {
  return xml.childrenNamed('data').reduce((translations, node) => {
    if (KeyPropertyMap[node.attr.name]) {
      translations.push({
        key: node.attr.name,
        localizedName: node.childNamed('value')?.val,
      });
    }
    return translations;
  }, [] as Translation[]);
}

function getTranslationsFromXlf(xml: XmlDocument): Translation[] {
  return (
    xml
      .descendantWithPath('file.body')
      ?.childrenNamed('trans-unit')
      ?.reduce((translations, node) => {
        if (KeyPropertyMap[node.attr.id]) {
          translations.push({
            key: node.attr.id,
            localizedName: node.childWithAttribute('state', 'translated')?.val,
          });
        }
        return translations;
      }, [] as Translation[]) ?? []
  );
}

function dynamicImport<T = unknown>(mod: string): Promise<T> {
  return new Function('p0', 'return import(p0)')(mod);
}
