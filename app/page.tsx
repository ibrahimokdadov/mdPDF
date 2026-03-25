'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import Preview from '@/components/Preview'
import ExportButton from '@/components/ExportButton'

const Editor = dynamic(() => import('@/components/Editor'), { ssr: false })

const DEFAULT_MARKDOWN = `# Welcome to mdPDF

Type your **Markdown** here and click **Export PDF** to download.

## Features

- GitHub-style rendering
- Tables, task lists, code blocks
- Syntax highlighting

\`\`\`js
const hello = 'world'
console.log(hello)
\`\`\`

| Column A | Column B |
|----------|----------|
| Value 1  | Value 2  |

- [x] Live preview
- [ ] Export to PDF
`

export default function Home() {
  const [markdown, setMarkdown] = useState(DEFAULT_MARKDOWN)

  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center justify-between px-4 py-2 border-b bg-white">
        <h1 className="text-lg font-semibold">mdPDF</h1>
        <ExportButton markdown={markdown} />
      </header>
      <main className="flex flex-1 overflow-hidden">
        <div className="w-1/2 border-r overflow-hidden">
          <Editor value={markdown} onChange={setMarkdown} />
        </div>
        <div className="w-1/2 overflow-auto bg-white">
          <Preview markdown={markdown} />
        </div>
      </main>
    </div>
  )
}
