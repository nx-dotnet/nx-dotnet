import { GithubChangelogMarkdownPlugin } from './github-plugin';

import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import remarkMdx from 'remark-mdx';
import { unified } from 'unified';
import { VFile } from 'vfile';

// async function createProcessorFactory() {
//   const { createProcessor: createMdxProcessor } = await import('@mdx-js/mdx');
//   const { default: rehypeRaw } = await import('rehype-raw');
//   const { VFile } = await import('vfile');

//   // /!\ this method is synchronous on purpose
//   // Using async code here can create cache entry race conditions!
//   function createProcessorSync({
//     plugins,
//     format,
//   }: {
//     plugins: [plugin: any, options: any][];
//     format: 'md' | 'mdx';
//   }) {
//     const remarkPlugins = plugins;
//     const rehypePlugins: any[] = [];

//     if (format === 'md') {
//       // This is what permits to embed HTML elements with format 'md'
//       // See https://github.com/facebook/docusaurus/pull/8960
//       // See https://github.com/mdx-js/mdx/pull/2295#issuecomment-1540085960
//       const rehypeRawPlugin = [
//         rehypeRaw,
//         {
//           passThrough: [
//             'mdxFlowExpression',
//             'mdxJsxFlowElement',
//             'mdxJsxTextElement',
//             'mdxTextExpression',
//             'mdxjsEsm',
//           ],
//         },
//       ];
//       rehypePlugins.unshift(rehypeRawPlugin);
//     }

//     const processorOptions = {
//       remarkPlugins,
//       rehypePlugins,
//       recmaPlugins: [],
//       providerImportSource: '@mdx-js/react',
//     };

//     const mdxProcessor = createMdxProcessor({
//       ...processorOptions,
//       remarkRehypeOptions: {},
//       format,
//     });

//     return {
//       process: async ({ content, filePath, frontMatter, compilerName }) => {
//         const vfile = new VFile({
//           value: content,
//           path: filePath,
//           data: {
//             frontMatter,
//             compilerName,
//           },
//         });
//         return mdxProcessor.process(vfile).then((result) => ({
//           content: result.toString(),
//           data: result.data,
//         }));
//       },
//     };
//   }

//   return { createProcessorSync };
// }

async function processChangelog(content: string) {
  const vfile: VFile = new VFile({
    value: content,
    path: 'CHANGELOG.md',
  });
  const transformed = await unified()
    .use(remarkParse)
    .use(GithubChangelogMarkdownPlugin, { repository: 'foo/bar' })
    .use(remarkMdx)
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(vfile);
  return transformed.value;
}

describe('github plugin', () => {
  it('should add changelog heading', async () => {
    expect(
      await processChangelog(
        `## 0.0.1
        - Initial release
        
        ## 0.0.2
        - Second release`,
      ),
    ).toMatchInlineSnapshot(`
      "<h1>Changelog</h1>
      <h2>0.0.1</h2>
      <ul>
      <li>Initial release</li>
      </ul>
      <h2>0.0.2</h2>
      <ul>
      <li>Second release</li>
      </ul>"
    `);
  });
});
