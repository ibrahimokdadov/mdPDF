'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import 'highlight.js/styles/github.css'
import type { StyleSettings } from '@/lib/style-settings'

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
        rehypePlugins={[rehypeRaw, rehypeHighlight]}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  )
}
