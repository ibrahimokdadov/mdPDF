import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeRaw from 'rehype-raw'
import rehypeHighlight from 'rehype-highlight'
import rehypeStringify from 'rehype-stringify'
import { visit } from 'unist-util-visit'
import { readFileSync } from 'fs'
import { join } from 'path'
import type { StyleSettings } from './style-settings'
import { DEFAULT_SETTINGS } from './style-settings'

function loadCss(packagePath: string): string {
  try {
    const fullPath = join(process.cwd(), 'node_modules', packagePath)
    return readFileSync(fullPath, 'utf-8')
  } catch {
    return ''
  }
}

function buildSettingsCss(s: StyleSettings): string {
  return `
body {
  background-color: ${s.backgroundColor};
  color: ${s.textColor};
  font-family: '${s.bodyFont}', serif;
  font-size: ${s.baseFontSize}px;
  line-height: ${s.lineHeight};
}
.markdown-body {
  background-color: ${s.backgroundColor} !important;
  color: ${s.textColor} !important;
  font-family: '${s.bodyFont}', serif !important;
  font-size: ${s.baseFontSize}px !important;
  line-height: ${s.lineHeight} !important;
}
.markdown-body h1,
.markdown-body h2,
.markdown-body h3,
.markdown-body h4,
.markdown-body h5,
.markdown-body h6 {
  font-family: '${s.headingFont}', serif !important;
  color: ${s.accentColor} !important;
}
.markdown-body a {
  color: ${s.linkColor} !important;
}
.markdown-body hr {
  border-color: ${s.accentColor} !important;
}
`
}

// Rehype plugin: transforms <pre><code class="language-mermaid"> into <div class="mermaid">
function rehypeMermaid() {
  return (tree: any) => {
    visit(tree, 'element', (node: any, index: number | undefined, parent: any) => {
      if (
        node.tagName === 'pre' &&
        node.children?.[0]?.tagName === 'code' &&
        node.children[0].properties?.className?.includes('language-mermaid') &&
        index !== undefined &&
        parent
      ) {
        const code = node.children[0].children?.[0]?.value ?? ''
        parent.children[index] = {
          type: 'element',
          tagName: 'div',
          properties: { className: ['mermaid'] },
          children: [{ type: 'text', value: code }],
        }
      }
    })
  }
}

export function markdownToHtml(markdown: string, settings: StyleSettings = DEFAULT_SETTINGS): string {
  const file = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeMermaid)
    .use(rehypeHighlight)
    .use(rehypeStringify)
    .processSync(markdown)

  const body = String(file)
  const githubCss = loadCss('github-markdown-css/github-markdown-light.css')
  const highlightCss = loadCss('highlight.js/styles/github.css')
  const settingsCss = buildSettingsCss(settings)

  const fontsToLoad = Array.from(new Set([settings.bodyFont, settings.headingFont]))
  const googleFontsImport = fontsToLoad
    .filter(f => !['Arial', 'Helvetica', 'Verdana', 'Trebuchet MS', 'Courier New'].includes(f))
    .map(f => `@import url('https://fonts.googleapis.com/css2?family=${encodeURIComponent(f)}:wght@400;600;700&display=swap');`)
    .join('\n')

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
${googleFontsImport}
body { padding: 2rem; max-width: 900px; margin: 0 auto; }
${githubCss}
${highlightCss}
${settingsCss}
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
<script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
<script>mermaid.initialize({ startOnLoad: true, theme: 'default' });</script>
</body>
</html>`
}
