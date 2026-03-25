'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github.css'

interface PreviewProps {
  markdown: string
}

export default function Preview({ markdown }: PreviewProps) {
  return (
    <div className="markdown-body px-8 py-6" style={{ minHeight: '100%' }}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
        {markdown}
      </ReactMarkdown>
    </div>
  )
}
