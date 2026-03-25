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
  const githubCss = loadCss('github-markdown-css/github-markdown.css')
  const highlightCss = loadCss('highlight.js/styles/github.css')

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
body { padding: 2rem; max-width: 900px; margin: 0 auto; }
${githubCss}
${highlightCss}
</style>
</head>
<body>
<div class="markdown-body">
${body}
</div>
</body>
</html>`
}
