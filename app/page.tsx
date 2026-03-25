'use client'

import { useRef, useState } from 'react'
import Editor from '@/components/Editor'
import Preview from '@/components/Preview'
import ExportButton from '@/components/ExportButton'

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
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setMarkdown(ev.target?.result as string)
    }
    reader.readAsText(file)
    // reset input so the same file can be re-uploaded
    e.target.value = ''
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center justify-between px-4 py-2 border-b bg-white">
        <h1 className="text-lg font-semibold">mdPDF</h1>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".md,.markdown,.txt"
            className="hidden"
            onChange={handleFileUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50"
          >
            Upload .md
          </button>
          <ExportButton markdown={markdown} />
        </div>
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
