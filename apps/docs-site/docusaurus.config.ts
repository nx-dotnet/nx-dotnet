import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type { PluginOptions as DocsPluginOptions } from '@docusaurus/plugin-content-docs';
import type * as Preset from '@docusaurus/preset-classic';
import {
  NormalizedSidebar,
  SidebarItemsGeneratorDoc,
} from '@docusaurus/plugin-content-docs/src/sidebars/types.js';

import { CopyChangelogPlugin } from './src/plugins/copy-changelog-plugin';
import { GithubChangelogMarkdownPlugin } from './src/plugins/github-plugin';

const sidebarItemsSorter: DocsPluginOptions['sidebarItemsGenerator'] = async ({
  defaultSidebarItemsGenerator,
  docs,
  ...args
}) => {
  function sortBySidebarOrder(
    a: SidebarItemsGeneratorDoc,
    b: SidebarItemsGeneratorDoc,
  ) {
    return a.sidebarPosition - b.sidebarPosition;
  }

  function sortCategoriesFirst(
    items: NormalizedSidebar,
    docsMap: Map<string, SidebarItemsGeneratorDoc>,
    level = 0,
  ) {
    const categories: any[] = [];
    const docs: any[] = [];

    for (const item of items) {
      if (item.type === 'category') {
        categories.push(item);
      } else {
        docs.push(item);
      }
    }

    docs.sort(sortBySidebarOrder);
    categories.sort(sortBySidebarOrder);

    const sorted =
      level === 0 ? [...docs, ...categories] : [...categories, ...docs];

    for (const item of sorted) {
      if (item.items) {
        item.items = sortCategoriesFirst(item.items, docsMap, level + 1);
      }
    }

    return sorted;
  }
  const docsMap = new Map(docs.map((doc) => [doc.id, doc]));
  const sidebarItems = await defaultSidebarItemsGenerator({ docs, ...args });
  return sortCategoriesFirst(sidebarItems, docsMap);
};

const config: Config = {
  title: 'nx-dotnet',
  tagline: 'Build what you love, where you love',
  url: 'https://nx-dotnet.com',
  baseUrl: '/',
  favicon: 'img/favicon.ico',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'nx-dotnet', // Usually your GitHub org/user name.
  projectName: 'nx-dotnet', // Usually your repo name.

  trailingSlash: false,

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  plugins: [CopyChangelogPlugin],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/',
          path: '../../docs',
          beforeDefaultRemarkPlugins: [
            [
              GithubChangelogMarkdownPlugin,
              { repository: 'nx-dotnet/nx-dotnet' },
            ],
          ],
          sidebarItemsGenerator: sidebarItemsSorter,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    navbar: {
      title: 'nx-dotnet',
      logo: {
        alt: 'nx-dotnet Logo',
        src: 'img/nx-dotnet-logo-dark.svg',
        srcDark: 'img/nx-dotnet-logo-light.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          href: 'https://github.com/nx-dotnet/nx-dotnet',
          className: 'header-github-link',
          'aria-label': 'GitHub repository',
          position: 'right',
          title: 'nx-dotnet on Github',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: '@nx-dotnet/core',
              to: 'core',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Stack Overflow',
              href: 'https://stackoverflow.com/questions/tagged/nx-dotnet',
            },
            {
              label: 'Gitter',
              href: 'https://gitter.im/nx-dotnet-plugin/community',
            },
            // {
            //   label: 'Twitter',
            //   href: 'https://twitter.com/docusaurus',
            // },
          ],
        },
        {
          title: 'More',
          items: [
            // {
            //   label: 'Blog',
            //   to: 'blog',
            // },
            {
              label: 'GitHub',
              href: 'https://github.com/nx-dotnet/nx-dotnet',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} nx-dotnet. Built with Docusaurus.`,
    },
    algolia: {
      apiKey: 'a58a8b950cf6da8341ee83b2845db46c',
      indexName: 'nx-dotnet',
      contextualSearch: false,
      appId: 'QLZWVNS55W',
    },
    prism: {
      additionalLanguages: ['typescript', 'bash'],
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
