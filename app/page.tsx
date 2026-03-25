'use client'

import { useRef, useState } from 'react'
import Editor from '@/components/Editor'
import Preview from '@/components/Preview'
import ExportButton from '@/components/ExportButton'

const DEFAULT_MARKDOWN = `# Welcome to mdPDF

Start writing **Markdown** on the left — your formatted preview appears here instantly. Click **Export PDF** when ready.

## What's supported

- **Bold**, *italic*, ~~strikethrough~~, \`inline code\`
- Tables, task lists, blockquotes
- Syntax-highlighted code blocks
- Headings, links, images

\`\`\`typescript
function greet(name: string): string {
  return \`Hello, \${name}!\`
}
\`\`\`

## A sample table

| Feature       | Status  |
|---------------|---------|
| Live preview  | ✅ Done  |
| PDF export    | ✅ Done  |
| File upload   | ✅ Done  |
| Dark editor   | ✅ Done  |

## Task list

- [x] Write your Markdown
- [x] See the live preview
- [ ] Export to PDF

> Upload any \`.md\` file with the button above, or just start typing here.
`

export default function Home() {
  const [markdown, setMarkdown] = useState(DEFAULT_MARKDOWN)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setMarkdown(ev.target?.result as string)
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-950">

      {/* Top gradient accent strip */}
      <div className="h-[2px] bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 flex-shrink-0" />

      {/* Header */}
      <header
        className="flex items-center justify-between px-5 flex-shrink-0 bg-slate-900"
        style={{
          height: '52px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-1 select-none">
          <span
            className="font-serif italic text-white text-xl leading-none"
            style={{ fontWeight: 400, letterSpacing: '-0.02em' }}
          >
            md
          </span>
          <svg
            className="w-4 h-4 text-indigo-400 mx-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
          <span
            className="font-serif text-white text-xl leading-none"
            style={{ fontWeight: 400, letterSpacing: '-0.02em' }}
          >
            PDF
          </span>
        </div>

        {/* Actions */}
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
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-400 rounded-md transition-all duration-150 hover:text-slate-200 hover:bg-slate-800"
            style={{ border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Upload .md
          </button>
          <ExportButton markdown={markdown} />
        </div>
      </header>

      {/* Panel labels row */}
      <div className="flex flex-shrink-0" style={{ height: '32px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div
          className="w-1/2 flex items-center px-5"
          style={{ borderRight: '1px solid rgba(255,255,255,0.06)', background: 'rgba(15,23,42,0.8)' }}
        >
          <span className="text-[10px] font-medium text-slate-500 uppercase tracking-[0.15em]">
            Markdown
          </span>
        </div>
        <div className="w-1/2 flex items-center px-5 bg-white">
          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.15em]">
            Preview
          </span>
        </div>
      </div>

      {/* Main panels */}
      <main className="flex flex-1 overflow-hidden">
        {/* Editor — dark */}
        <div
          className="w-1/2 overflow-hidden"
          style={{ background: '#0d1424', borderRight: '1px solid rgba(255,255,255,0.06)' }}
        >
          <Editor value={markdown} onChange={setMarkdown} />
        </div>

        {/* Preview — light */}
        <div className="w-1/2 overflow-auto bg-white preview-scroll">
          <Preview markdown={markdown} />
        </div>
      </main>
    </div>
  )
}
