'use client'

import { useEffect, useRef, useState } from 'react'
import Editor from '@/components/Editor'
import Preview from '@/components/Preview'
import ExportButton from '@/components/ExportButton'
import StyleSidebar from '@/components/StyleSidebar'
import FormatToolbar from '@/components/FormatToolbar'
import { loadSettings, saveSettings, DEFAULT_SETTINGS } from '@/lib/style-settings'
import type { StyleSettings } from '@/lib/style-settings'
import { wrap } from '@/lib/format-helpers'
import type { FormatType } from '@/lib/format-helpers'

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
| Style sidebar | ✅ Done  |
| Format toolbar| ✅ Done  |

## Task list

- [x] Write your Markdown
- [x] See the live preview
- [ ] Export to PDF

> Upload any \`.md\` file with the button above, or just start typing here.
`

export default function Home() {
  const [markdown, setMarkdown] = useState(DEFAULT_MARKDOWN)
  const [past, setPast] = useState<string[]>([])
  const [settings, setSettings] = useState<StyleSettings>(DEFAULT_SETTINGS)
  const [selection, setSelection] = useState({ selectionStart: 0, selectionEnd: 0 })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const historySnapshotRef = useRef(DEFAULT_MARKDOWN)

  useEffect(() => {
    setSettings(loadSettings())
  }, [])

  function pushHistory(snapshot: string) {
    setPast(prev => [...prev, snapshot])
  }

  function handleMarkdownChange(value: string) {
    if (!debounceRef.current) {
      historySnapshotRef.current = markdown
    } else {
      clearTimeout(debounceRef.current)
    }
    setMarkdown(value)
    debounceRef.current = setTimeout(() => {
      pushHistory(historySnapshotRef.current)
      debounceRef.current = null
    }, 500)
  }

  function beforeProgrammaticChange() {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
      debounceRef.current = null
      pushHistory(historySnapshotRef.current)
    }
    pushHistory(markdown)
  }

  function handleUndo() {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
      debounceRef.current = null
      setMarkdown(historySnapshotRef.current)
      return
    }
    if (past.length === 0) return
    const restored = past[past.length - 1]
    setPast(prev => prev.slice(0, -1))
    setMarkdown(restored)
  }

  function handleSettingsChange(patch: Partial<StyleSettings>) {
    setSettings(prev => {
      const next = { ...prev, ...patch }
      saveSettings(next)
      return next
    })
  }

  function handleReset() {
    saveSettings(DEFAULT_SETTINGS)
    setSettings(DEFAULT_SETTINGS)
  }

  function handleSelect(selectionStart: number, selectionEnd: number) {
    setSelection({ selectionStart, selectionEnd })
  }

  function insertSnippet(text: string) {
    beforeProgrammaticChange()
    const pos = selection.selectionStart
    const before = markdown.slice(0, pos)
    const after = markdown.slice(pos)
    const snippet = '\n\n' + text + '\n\n'
    const newMarkdown = before + snippet + after
    const newPos = pos + snippet.length
    setMarkdown(newMarkdown)
    setSelection({ selectionStart: newPos, selectionEnd: newPos })
    requestAnimationFrame(() => {
      textareaRef.current?.focus()
      textareaRef.current?.setSelectionRange(newPos, newPos)
    })
  }

  function applyFormat(type: FormatType, value?: string) {
    const { selectionStart: start, selectionEnd: end } = selection
    const selected = markdown.slice(start, end)
    if (!selected) return
    beforeProgrammaticChange()

    const wrapped = wrap(type, selected, value)
    const newPos = start + wrapped.length

    setMarkdown(markdown.slice(0, start) + wrapped + markdown.slice(end))
    setSelection({ selectionStart: newPos, selectionEnd: newPos })

    requestAnimationFrame(() => {
      textareaRef.current?.focus()
      textareaRef.current?.setSelectionRange(newPos, newPos)
    })
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    beforeProgrammaticChange()
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
        style={{ height: '52px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-1 select-none">
          <span className="font-serif italic text-white text-xl leading-none" style={{ fontWeight: 400, letterSpacing: '-0.02em' }}>md</span>
          <svg className="w-4 h-4 text-indigo-400 mx-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
          <span className="font-serif text-white text-xl leading-none" style={{ fontWeight: 400, letterSpacing: '-0.02em' }}>PDF</span>
        </div>
        <div className="flex items-center gap-2">
          <input ref={fileInputRef} type="file" accept=".md,.markdown,.txt" className="hidden" onChange={handleFileUpload} />
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
          <ExportButton markdown={markdown} settings={settings} />
        </div>
      </header>

      {/* Panel labels row */}
      <div className="flex flex-shrink-0" style={{ height: '32px' }}>
        <div style={{ width: '260px', minWidth: '40px', background: 'white', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }} />
        <div className="flex-1 flex items-center px-5" style={{ borderRight: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(15,23,42,0.8)' }}>
          <span className="text-[10px] font-medium text-slate-500 uppercase tracking-[0.15em]">Markdown</span>
        </div>
        <div className="flex-1 flex items-center px-5 bg-white" style={{ borderBottom: '1px solid #e2e8f0' }}>
          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.15em]">Preview</span>
          <span className="ml-auto text-[9px] text-slate-300 italic">Preview is approximate</span>
        </div>
      </div>

      {/* Main panels */}
      <main className="flex flex-1 overflow-hidden">
        <StyleSidebar settings={settings} onChange={handleSettingsChange} onReset={handleReset} />
        {/* Editor column */}
        <div className="flex-1 flex flex-col overflow-hidden" style={{ background: '#0d1424', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
          <FormatToolbar
            hasSelection={selection.selectionStart !== selection.selectionEnd}
            onFormat={applyFormat}
            onInsert={insertSnippet}
            canUndo={past.length > 0 || debounceRef.current !== null}
            onUndo={handleUndo}
          />
          <Editor
            value={markdown}
            onChange={handleMarkdownChange}
            textareaRef={textareaRef}
            onSelect={handleSelect}
          />
        </div>
        <div className="flex-1 overflow-auto bg-white preview-scroll">
          <Preview markdown={markdown} settings={settings} />
        </div>
      </main>
    </div>
  )
}
