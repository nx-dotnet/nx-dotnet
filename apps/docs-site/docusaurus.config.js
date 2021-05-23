module.exports = {
  title: 'nx-dotnet',
  tagline: 'Build what you love, where you love',
  url: 'https://nx-dotnet.github.io',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'nx-dotnet', // Usually your GitHub org/user name.
  projectName: 'nx-dotnet', // Usually your repo name.
  themeConfig: {
    navbar: {
      title: 'nx-dotnet',
      // logo: {
      //   alt: 'nx-dotnet logo',
      //   src: 'img/nx-dotnet-logo.png',
      // },
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
          label: 'GitHub',
          position: 'right',
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
            {
              label: '@nx-dotnet/nxdoc',
              to: 'docs/nxdoc/',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Stack Overflow',
              href: 'https://stackoverflow.com/questions/tagged/nxdoc',
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
};
