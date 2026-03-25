import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeHighlight from 'rehype-highlight'
import rehypeStringify from 'rehype-stringify'
import { readFileSync } from 'fs'
import { join } from 'path'

function loadCss(packagePath: string): string {
  try {
    const fullPath = join(process.cwd(), 'node_modules', packagePath)
    return readFileSync(fullPath, 'utf-8')
  } catch {
    return ''
  }
}

export function markdownToHtml(markdown: string): string {
  const file = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeHighlight)
    .use(rehypeStringify)
    .processSync(markdown)

  const body = String(file)
  const githubCss = loadCss('github-markdown-css/github-markdown-light.css')
  const highlightCss = loadCss('highlight.js/styles/github.css')

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
body { padding: 2rem; max-width: 900px; margin: 0 auto; }
${githubCss}
${highlightCss}
.markdown-body p,
.markdown-body h1,
.markdown-body h2,
.markdown-body h3,
.markdown-body h4,
.markdown-body h5,
.markdown-body h6,
.markdown-body li,
.markdown-body td,
.markdown-body th,
.markdown-body blockquote {
  unicode-bidi: plaintext;
  text-align: start;
}
</style>
</head>
<body>
<div class="markdown-body">
${body}
</div>
</body>
</html>`
}
