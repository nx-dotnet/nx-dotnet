module.exports = {
  title: 'nx-dotnet',
  tagline: 'Build what you love, where you love',
  url: 'https://nx-dotnet.com',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'nx-dotnet', // Usually your GitHub org/user name.
  projectName: 'nx-dotnet', // Usually your repo name.
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
          to: 'docs/',
          activeBasePath: 'docs',
          label: 'Docs',
          position: 'left',
        },
        // { to: 'blog', label: 'Blog', position: 'left' },
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
              to: 'docs/core',
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
      additionalLanguages: ['json5', 'typescript', 'bash'],
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl: 'https://github.com/nx-dotnet/nx-dotnet/edit/master/docs/',
          path: '../../docs',
          sidebarItemsGenerator: sidebarItemsSorter,
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl:
            'https://github.com/nx-dotnet/nx-dotnet/edit/master/apps/docs-site/blog/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
  // plugins: [
  //   [
  //     '@docusaurus/plugin-content-docs',
  //     {

  //       path: '../../docs',
  //     },
  //   ],
  // ],
};

async function sidebarItemsSorter({
  defaultSidebarItemsGenerator,
  docs,
  ...args
}) {
  function sortCategoriesFirst(items, docsMap) {
    const categories = [];
    const docs = [];

    for (const item of items) {
      if (item.type === 'category') {
        categories.push(item);
      } else {
        docs.push(item);
      }
    }

    const index = docs.findIndex((item) => item.id === 'index');
    if (index !== -1) {
      const [doc] = docs.splice(index, 1);
      categories.unshift(doc);
    }
    const sorted = [...categories, ...docs];

    for (const item of sorted) {
      if (item.items) {
        item.items = sortCategoriesFirst(item.items, docsMap);
      }
    }

    return sorted;
  }
  const docsMap = new Map(docs.map((doc) => [doc.id, doc]));
  const sidebarItems = await defaultSidebarItemsGenerator({ docs, ...args });
  return sortCategoriesFirst(sidebarItems, docsMap);
}
