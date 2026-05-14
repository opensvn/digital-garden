import matter, { Input } from 'gray-matter';
import { unified } from 'unified';
import markdown from 'remark-parse';
import remarkGfm from 'remark-gfm';
import { wikiLinkPlugin } from 'remark-wiki-link';
import html from 'remark-html';
import frontmatter from 'remark-frontmatter';
import externalLinks from 'rehype-external-links';
import highlight from 'rehype-highlight';
import { Node } from './node';
import rehypePrism from 'rehype-prism-plus';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import obsidianImage from './obsidian-image';
import { getAllMarkdownFiles, toFilePath, toSlug } from './utils';

type FileContent = Input | { content: Input };

interface BackLink {
  title: string | null;
  slug: string;
  shortSummary: string;
}

export const Transformer = {
  haveFrontMatter: function (content: Input) {
    if (!content) return false;
    const indexOfFirst = content.indexOf('---');
    if (indexOfFirst === -1) {
      return false;
    }
    let indexOfSecond = content.indexOf('---', indexOfFirst + 1);
    return indexOfSecond !== -1;
  },
  getFrontMatterData: function (fileContent: FileContent) {
    const isFileContentObject = typeof fileContent === 'object' && "content" in fileContent;
    const content = isFileContentObject ? fileContent.content : fileContent;
    if (Transformer.haveFrontMatter(content)) {
      return matter(content).data;
    }
    return {};
  },

  pageResolver: function (pageName: string) {
    const allFileNames = getAllMarkdownFiles();
    const result = allFileNames.find(aFile => {
      let parseFileNameFromPath = Transformer.parseFileNameFromPath(aFile) ?? "";
      return (
        Transformer.normalizeFileName(parseFileNameFromPath) ===
        Transformer.normalizeFileName(pageName)
      );
    });

    // permalink = permalink.replace("ç", "c").replace("ı", "i").replace("ş", "s")
    // console.log(`/note/${toSlug(result)}`)
    if (result === undefined || result.length === 0) {
      // console.log("Cannot resolve file path   " + pageName)
    }

    // console.log("Internal Link resolved:   [" + pageName + "] ==> [" + temp[0] +"]")
    return result !== undefined && result.length > 0 ? [toSlug(result)] : ['/'];
  },
  hrefTemplate: function (permalink: string) {
    // permalink = Transformer.normalizeFileName(permalink)
    permalink = permalink.replace('ç', 'c').replace('ı', 'i').replace('ş', 's');
    return `/wiki/${permalink}`;
  },
  getHtmlContent: function (content: string) {
    const htmlContent: string[] = [];
    const sanitizedContent = Transformer.preprocessThreeDashes(content);

    unified()
      .use(markdown)
      .use(remarkGfm)
      .use(obsidianImage)
      .use(highlight)
      .use(externalLinks, { target: '_blank', rel: ['noopener'] })
      // .use(frontmatter, ['yaml', 'toml'])
      .use(wikiLinkPlugin, {
        permalinks: null,
        pageResolver: function (pageName: string) {
          return Transformer.pageResolver(pageName);
        },
        hrefTemplate: function (permalink: string) {
          return Transformer.hrefTemplate(permalink);
        },

        aliasDivider: '|',
      })
      .use(remarkRehype)
      .use(rehypePrism)
      .use(rehypeStringify)
      .process(sanitizedContent, function (err, file): undefined {
        htmlContent.push(String(file).replace('\n', ''));
        if (err) {
          console.log('ERRROR:' + err);
        }
      });
    const joindedHTMLContent = htmlContent.join('');
    const splittedHTMLContent = joindedHTMLContent.split('---');
    return [splittedHTMLContent];
  },

  /* SANITIZE MARKDOWN FOR --- */
  preprocessThreeDashes: function (content: string) {
    if (!content.startsWith('---')) {
      return content;
    }

    return matter(content).content;
  },

  /* Normalize File Names */
  normalizeFileName: function (filename: string) {
    let processedFileName = filename.replace('.md', '');
    processedFileName = processedFileName.replace('(', '').replace(')', '');
    processedFileName = processedFileName.split(' ').join('-');
    processedFileName = processedFileName.toLowerCase();
    const conversionLetters = [
      ['ç', 'c'],
      ['ş', 's'],
      ['ı', 'i'],
      ['ü', 'u'],
      ['ö', 'o'],
      ['ğ', 'g'],
      ['Ç', 'C'],
      ['Ş', 'S'],
      ['İ', 'I'],
      ['Ü', 'U'],
      ['Ö', 'O'],
      ['Ğ', 'G'],
    ];
    conversionLetters.forEach(letterPair => {
      processedFileName = processedFileName.split(letterPair[0]).join(letterPair[1]);
      //processedFileName = processedFileName.replace(letterPair[0], letterPair[1])
    });
    //console.log("filename", processedFileName)
    return processedFileName;
  },
  /* Parse file name from path then sanitize it */
  parseFileNameFromPath: function (filepath: string) {
    const parsedFileFromPath = filepath.split(/[\\/]/).pop();
    return parsedFileFromPath != null && parsedFileFromPath.length > 0
      ? parsedFileFromPath.replace('.md', '')
      : null;
  },
  /* Pair provided and existing Filenames*/
  getInternalLinks: function (aFilePath: string) {
    const fileContent = Node.readFileSync(aFilePath);
    const internalLinks: BackLink[] = [];
    const sanitizedContent = Transformer.preprocessThreeDashes(fileContent);
    unified()
      .use(markdown)
      .use(remarkGfm)
      .use(wikiLinkPlugin, {
        pageResolver: function (pageName: string) {
          // let name = [Transformer.parseFileNameFromPath(pageName)];

          let canonicalSlug;
          if (pageName.includes('#')) {
            // console.log(pageName)
            const tempSlug = pageName.split('#')[0];
            if (tempSlug.length === 0) {
              // Meaning it in form of #Heading1 --> slug will be this file slug
              canonicalSlug = toSlug(aFilePath);
            } else {
              canonicalSlug = Transformer.pageResolver(tempSlug)[0].split('#')[0];
            }
          } else {
            canonicalSlug = Transformer.pageResolver(pageName)[0].split('#')[0];
          }

          const backLink = {
            title: Transformer.parseFileNameFromPath(toFilePath(canonicalSlug) ?? ""),
            slug: canonicalSlug,
            shortSummary: canonicalSlug,
          };

          if (canonicalSlug != null && internalLinks.findIndex((backLink) => backLink.slug === canonicalSlug) < 0) {
            internalLinks.push(backLink);
          }

          return [canonicalSlug];
        },
        hrefTemplate: function (permalink: string) {
          return Transformer.hrefTemplate(permalink);
        },

        aliasDivider: '|',
      })
      .use(html)
      .processSync(sanitizedContent);

    // console.log("Internal Links of:   "  + aFilePath)
    // internalLinks.forEach(aLink => {
    //     console.log(aLink.title + " --> " + aLink.slug)
    // })
    // console.log("===============Internal Links")
    return internalLinks;
  },
};
