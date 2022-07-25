import {
  Tree,
  formatFiles,
  installPackagesTask,
  workspaceRoot,
  joinPathFragments,
  logger,
  generateFiles,
  names,
} from '@nrwl/devkit';
import { XmlDocument } from 'xmldoc';
import fetch from 'node-fetch';
import { join, relative } from 'path';

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

export default async function (tree: Tree, schema: any) {
  const enXml = await fetch(
    `https://raw.githubusercontent.com/dotnet/templating/master/src/Microsoft.TemplateEngine.Cli/LocalizableStrings.resx`,
  ).then((x) => x.text());

  const translationDirectoryContents = (await fetch(
    `https://api.github.com/repos/dotnet/templating/contents/src/Microsoft.TemplateEngine.Cli/xlf`,
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

  const languages = [];
  for (const translation of translations) {
    generateFiles(tree, join(__dirname, 'files'), outputDirectory, {
      tmpl: '',
      language: translation.lang,
      pairs: translation.pairs,
      KeyPropertyMap,
    });
    languages.push({ ...names(translation.lang), raw: translation.lang });
  }
  generateFiles(tree, join(__dirname, 'index_tmpl_'), outputDirectory, {
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
