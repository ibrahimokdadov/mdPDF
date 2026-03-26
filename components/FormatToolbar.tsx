'use client'

import { useState } from 'react'
import { FONT_OPTIONS } from '@/lib/style-settings'
import type { FontOption } from '@/lib/style-settings'
import type { FormatType } from '@/lib/format-helpers'

interface FormatToolbarProps {
  hasSelection: boolean
  onFormat: (type: FormatType, value?: string) => void
  onInsert: (text: string) => void
  canUndo: boolean
  onUndo: () => void
}

const FONT_SIZES = ['10', '12', '14', '16', '18', '20', '24', '28', '32', '36']

const DIAGRAM_TEMPLATES: { label: string; template: string }[] = [
  { label: 'Flowchart', template: '```mermaid\ngraph TD\n  A[Start] --> B[Process]\n  B --> C[End]\n```' },
  { label: 'Sequence', template: '```mermaid\nsequenceDiagram\n  Alice->>Bob: Request\n  Bob-->>Alice: Response\n```' },
  { label: 'ER Diagram', template: '```mermaid\nerDiagram\n  USER ||--o{ ORDER : places\n  ORDER ||--|{ ITEM : contains\n```' },
  { label: 'State', template: '```mermaid\nstateDiagram-v2\n  [*] --> Idle\n  Idle --> Running: start\n  Running --> Idle: stop\n  Running --> [*]\n```' },
  { label: 'Gantt', template: '```mermaid\ngantt\n  title Project Plan\n  dateFormat YYYY-MM-DD\n  section Phase 1\n  Task A: 2024-01-01, 7d\n  Task B: 2024-01-08, 5d\n```' },
  { label: 'Pie Chart', template: '```mermaid\npie\n  title Distribution\n  "Category A" : 40\n  "Category B" : 35\n  "Category C" : 25\n```' },
  { label: 'Class Diagram', template: '```mermaid\nclassDiagram\n  class Animal {\n    +String name\n    +speak()\n  }\n  Animal <|-- Dog\n  Animal <|-- Cat\n```' },
  { label: 'Git Graph', template: '```mermaid\ngitGraph\n  commit\n  branch feature\n  checkout feature\n  commit\n  commit\n  checkout main\n  merge feature\n```' },
  { label: 'Mind Map', template: '```mermaid\nmindmap\n  root((Topic))\n    Subtopic A\n      Detail 1\n      Detail 2\n    Subtopic B\n      Detail 3\n```' },
]

export default function FormatToolbar({ hasSelection, onFormat, onInsert, canUndo, onUndo }: FormatToolbarProps) {
  const [showTextColor, setShowTextColor] = useState(false)
  const [showHighlight, setShowHighlight] = useState(false)
  const [showDiagrams, setShowDiagrams] = useState(false)
  const [textColor, setTextColor] = useState('#e11d48')
  const [highlightColor, setHighlightColor] = useState('#fde047')

  const disabled = !hasSelection
  const btnCls = `flex items-center justify-center w-7 h-7 rounded text-slate-400 transition-colors
    ${disabled ? 'opacity-40 pointer-events-none' : 'hover:text-slate-100 hover:bg-slate-800'}`

  function md(type: FormatType, value?: string) {
    return (e: React.MouseEvent) => {
      e.preventDefault()
      onFormat(type, value)
    }
  }

  return (
    <div
      className="flex-shrink-0 flex items-center gap-0.5 px-3 select-none"
      style={{
        height: '34px',
        background: 'rgba(13,20,36,0.98)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Undo */}
      <button
        className={`flex items-center justify-center w-7 h-7 rounded text-slate-400 transition-colors ${!canUndo ? 'opacity-40 pointer-events-none' : 'hover:text-slate-100 hover:bg-slate-800'}`}
        onMouseDown={(e) => { e.preventDefault(); onUndo() }}
        title="Undo"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a5 5 0 010 10H9m-6-10l4-4M3 10l4 4" />
        </svg>
      </button>

      {/* Divider */}
      <div className="w-px h-4 bg-white/10 mx-1" />

      {/* Bold */}
      <button className={btnCls} onMouseDown={md('bold')} title="Bold">
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h8a4 4 0 010 8H6V4zm0 8h9a4 4 0 010 8H6v-8z"/></svg>
      </button>

      {/* Italic */}
      <button className={btnCls} onMouseDown={md('italic')} title="Italic">
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M10 4h4l-4 16H6l4-16zm4 0h4M6 20h4"/><path stroke="currentColor" strokeWidth="2" d="M10 4h4m-4 0L6 20m4-16L6 20m8-16l-4 16m4-16h4M6 20h4"/></svg>
      </button>

      {/* Underline */}
      <button className={btnCls} onMouseDown={md('underline')} title="Underline">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M6 4v6a6 6 0 0012 0V4M4 20h16"/></svg>
      </button>

      {/* Strikethrough */}
      <button className={btnCls} onMouseDown={md('strike')} title="Strikethrough">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M6 12h12M9 4c-2 0-3.5 1.5-3.5 3.5S7 11 12 11m3 1c2.5 1 3.5 2.5 3.5 4S17 20 12 20s-6-1.5-6-4"/></svg>
      </button>

      {/* Divider */}
      <div className="w-px h-4 bg-white/10 mx-1" />

      {/* Text Color */}
      <div className="relative">
        <button
          className={btnCls}
          onMouseDown={(e) => { if (!disabled) { e.preventDefault(); setShowTextColor(v => !v); setShowHighlight(false) } }}
          title="Text Color"
        >
          <span className="text-[11px] font-bold leading-none" style={{ borderBottom: `2px solid ${textColor}` }}>A</span>
        </button>
        {showTextColor && (
          <div
            className="absolute top-full left-0 mt-1 z-50 bg-slate-900 border border-slate-700 rounded p-2 shadow-xl flex flex-col gap-2"
            onMouseDown={e => e.preventDefault()}
          >
            <input
              type="color"
              value={textColor}
              onChange={e => setTextColor(e.target.value)}
              className="w-full h-7 rounded cursor-pointer border-0"
            />
            <input
              type="text"
              value={textColor}
              onChange={e => /^#[0-9a-fA-F]{0,6}$/.test(e.target.value) && setTextColor(e.target.value)}
              className="w-24 text-xs bg-slate-800 text-slate-200 border border-slate-600 rounded px-1.5 py-1 font-mono"
            />
            <button
              className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded px-2 py-1"
              onMouseDown={(e) => { e.preventDefault(); onFormat('color', textColor); setShowTextColor(false) }}
            >
              Apply
            </button>
          </div>
        )}
      </div>

      {/* Highlight */}
      <div className="relative">
        <button
          className={btnCls}
          onMouseDown={(e) => { if (!disabled) { e.preventDefault(); setShowHighlight(v => !v); setShowTextColor(false) } }}
          title="Highlight"
        >
          <span className="text-[11px] font-bold leading-none px-0.5" style={{ backgroundColor: highlightColor, color: '#0f172a' }}>H</span>
        </button>
        {showHighlight && (
          <div
            className="absolute top-full left-0 mt-1 z-50 bg-slate-900 border border-slate-700 rounded p-2 shadow-xl flex flex-col gap-2"
            onMouseDown={e => e.preventDefault()}
          >
            <input
              type="color"
              value={highlightColor}
              onChange={e => setHighlightColor(e.target.value)}
              className="w-full h-7 rounded cursor-pointer border-0"
            />
            <input
              type="text"
              value={highlightColor}
              onChange={e => /^#[0-9a-fA-F]{0,6}$/.test(e.target.value) && setHighlightColor(e.target.value)}
              className="w-24 text-xs bg-slate-800 text-slate-200 border border-slate-600 rounded px-1.5 py-1 font-mono"
            />
            <button
              className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded px-2 py-1"
              onMouseDown={(e) => { e.preventDefault(); onFormat('highlight', highlightColor); setShowHighlight(false) }}
            >
              Apply
            </button>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="w-px h-4 bg-white/10 mx-1" />

      {/* Font Family */}
      <select
        disabled={disabled}
        className={`text-[11px] bg-slate-800 text-slate-300 border border-slate-700 rounded px-1.5 py-0.5 h-6 ${disabled ? 'opacity-40' : 'hover:border-slate-500'}`}
        defaultValue=""
        onMouseDown={e => { if (disabled) e.preventDefault() }}
        onChange={e => { onFormat('fontFamily', e.target.value as FontOption); e.target.value = '' }}
      >
        <option value="" disabled>Font</option>
        {FONT_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
      </select>

      {/* Font Size */}
      <select
        disabled={disabled}
        className={`text-[11px] bg-slate-800 text-slate-300 border border-slate-700 rounded px-1.5 py-0.5 h-6 ml-1 ${disabled ? 'opacity-40' : 'hover:border-slate-500'}`}
        defaultValue=""
        onMouseDown={e => { if (disabled) e.preventDefault() }}
        onChange={e => { onFormat('fontSize', e.target.value); e.target.value = '' }}
      >
        <option value="" disabled>Size</option>
        {FONT_SIZES.map(s => <option key={s} value={s}>{s}px</option>)}
      </select>

      {/* Divider */}
      <div className="w-px h-4 bg-white/10 mx-1" />

      {/* Insert Diagram */}
      <div className="relative">
        <button
          className="flex items-center gap-1 px-2 h-6 rounded text-[11px] text-slate-400 hover:text-slate-100 hover:bg-slate-800 border border-slate-700 hover:border-slate-500 transition-colors"
          onMouseDown={e => { e.preventDefault(); setShowDiagrams(v => !v); setShowTextColor(false); setShowHighlight(false) }}
          title="Insert Diagram"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
          </svg>
          Diagram
        </button>
        {showDiagrams && (
          <div
            className="absolute top-full left-0 mt-1 z-50 bg-slate-900 border border-slate-700 rounded shadow-xl py-1 min-w-[140px]"
            onMouseDown={e => e.preventDefault()}
          >
            {DIAGRAM_TEMPLATES.map(({ label, template }) => (
              <button
                key={label}
                className="w-full text-left px-3 py-1.5 text-[11px] text-slate-300 hover:bg-slate-800 hover:text-slate-100 transition-colors"
                onMouseDown={e => { e.preventDefault(); onInsert(template); setShowDiagrams(false) }}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
