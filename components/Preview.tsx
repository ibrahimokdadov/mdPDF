'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
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
        fontFamily: `'${settings.bodyFont}', serif`,
        fontSize: `${settings.baseFontSize}px`,
        lineHeight: settings.lineHeight,
        color: settings.textColor,
        backgroundColor: settings.backgroundColor,
      }}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
        {markdown}
      </ReactMarkdown>
    </div>
  )
}
