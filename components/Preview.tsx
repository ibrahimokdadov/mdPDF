'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import 'highlight.js/styles/github.css'
import type { StyleSettings } from '@/lib/style-settings'
import MermaidDiagram from '@/components/MermaidDiagram'

interface PreviewProps {
  markdown: string
  settings: StyleSettings
}

export default function Preview({ markdown, settings }: PreviewProps) {
  return (
    <div
      className="markdown-body px-8 py-6"
      dir="auto"
      style={{
        minHeight: '100%',
        '--md-body-font': `'${settings.bodyFont}', serif`,
        '--md-heading-font': `'${settings.headingFont}', serif`,
        '--md-font-size': `${settings.baseFontSize}px`,
        '--md-line-height': String(settings.lineHeight),
        '--md-text-color': settings.textColor,
        '--md-accent-color': settings.accentColor,
        '--md-link-color': settings.linkColor,
        '--md-bg-color': settings.backgroundColor,
      } as React.CSSProperties}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        remarkRehypeOptions={{ allowDangerousHtml: true }}
        rehypePlugins={[rehypeRaw, [rehypeHighlight, { ignoreMissing: true }]]}
        components={{
          pre({ node, children, ...props }) {
            // Inspect the hast node directly to find a mermaid code child
            const codeChild = (node?.children ?? []).find(
              (c: any) => c.type === 'element' && c.tagName === 'code'
            ) as any
            const classes: string[] = codeChild?.properties?.className ?? []
            if (classes.includes('language-mermaid')) {
              const textNode = codeChild.children?.find((c: any) => c.type === 'text')
              const chart = textNode?.value ?? ''
              return <MermaidDiagram chart={chart.trim()} />
            }
            return <pre {...props}>{children}</pre>
          },
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  )
}
