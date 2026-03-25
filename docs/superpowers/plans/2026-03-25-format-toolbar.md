# Format Toolbar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a fixed formatting toolbar above the editor that wraps selected text in markdown/HTML syntax (Bold, Italic, Underline, Strikethrough, Text Color, Highlight, Font Family, Font Size) and renders the inline HTML in both the live preview and exported PDF.

**Architecture:** A `wrap` pure function in `lib/format-helpers.ts` converts a `(type, selected, value)` call into the correct markdown/HTML string. `FormatToolbar` (a fixed strip inside the editor column) calls `applyFormat` in `page.tsx`, which uses `wrap` to splice the result back into the markdown string and resets selection state. Both the preview (`rehype-raw` + `remarkRehypeOptions`) and the PDF pipeline (`remarkRehype { allowDangerousHtml }` + `rehype-raw`) are updated to pass inline HTML through.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, rehype-raw, unified pipeline

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `lib/format-helpers.ts` | Create | `wrap` pure function — converts format type + selected text + value to output string |
| `__tests__/format-helpers.test.ts` | Create | Unit tests for `wrap` |
| `components/FormatToolbar.tsx` | Create | Fixed toolbar UI — buttons, color pickers, font/size selects; all use `onMouseDown + e.preventDefault()` |
| `components/Editor.tsx` | Modify | Accept `textareaRef` prop + `onSelect` callback |
| `app/page.tsx` | Modify | Selection state, `applyFormat`, render `<FormatToolbar>` inside editor column |
| `components/Preview.tsx` | Modify | Add `remarkRehypeOptions` + `rehypeRaw` to ReactMarkdown |
| `lib/markdown-to-html.ts` | Modify | Add `{ allowDangerousHtml: true }` to `remarkRehype`, add `rehypeRaw` before `rehypeHighlight` |
| `__tests__/markdown-to-html.test.ts` | Modify | Add test: inline HTML passes through to PDF output |

---

## Task 1: Install rehype-raw

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install rehype-raw**

```bash
cd C:\Users\ibrah\cascadeProjects\mdpdf
npm install rehype-raw
```

Expected: `rehype-raw` appears in `dependencies` in `package.json`.

- [ ] **Step 2: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add rehype-raw for inline HTML passthrough"
```

---

## Task 2: Update `lib/markdown-to-html.ts` (TDD)

**Files:**
- Modify: `lib/markdown-to-html.ts`
- Modify: `__tests__/markdown-to-html.test.ts`

- [ ] **Step 1: Add failing test**

Append to `__tests__/markdown-to-html.test.ts`:

```typescript
describe('markdownToHtml — inline HTML passthrough', () => {
  it('passes <u> tag through to output', () => {
    const result = markdownToHtml('hello <u>world</u>')
    expect(result).toContain('<u>world</u>')
  })

  it('passes <span style> through to output', () => {
    const result = markdownToHtml('<span style="color:#ff0000">red</span>')
    expect(result).toContain('color:#ff0000')
    expect(result).toContain('red')
  })
})
```

- [ ] **Step 2: Run to verify they fail**

```bash
NODE_OPTIONS=--experimental-vm-modules npx jest __tests__/markdown-to-html.test.ts --no-coverage 2>&1 | tail -10
```

Expected: FAIL — `<u>` and `<span>` are stripped from output.

- [ ] **Step 3: Update `lib/markdown-to-html.ts`**

Add `import rehypeRaw from 'rehype-raw'` and update the unified pipeline:

```typescript
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeRaw from 'rehype-raw'
import rehypeHighlight from 'rehype-highlight'
import rehypeStringify from 'rehype-stringify'
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

export function markdownToHtml(markdown: string, settings: StyleSettings = DEFAULT_SETTINGS): string {
  const file = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
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
</body>
</html>`
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
NODE_OPTIONS=--experimental-vm-modules npx jest __tests__/markdown-to-html.test.ts --no-coverage 2>&1 | tail -10
```

Expected: PASS — 11 tests passing.

- [ ] **Step 5: Run full suite**

```bash
NODE_OPTIONS=--experimental-vm-modules npx jest --no-coverage 2>&1 | tail -8
```

Expected: all tests passing.

- [ ] **Step 6: Commit**

```bash
git add lib/markdown-to-html.ts __tests__/markdown-to-html.test.ts
git commit -m "feat: markdown-to-html passes inline HTML through via rehype-raw"
```

---

## Task 3: Update `components/Preview.tsx`

**Files:**
- Modify: `components/Preview.tsx`

- [ ] **Step 1: Update Preview.tsx**

```tsx
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
```

- [ ] **Step 2: Verify build passes**

```bash
npm run build 2>&1 | tail -8
```

Expected: `✓ Compiled successfully`

- [ ] **Step 3: Commit**

```bash
git add components/Preview.tsx
git commit -m "feat: preview passes inline HTML through via rehype-raw"
```

---

## Task 4: `lib/format-helpers.ts` (TDD)

**Files:**
- Create: `lib/format-helpers.ts`
- Create: `__tests__/format-helpers.test.ts`

- [ ] **Step 1: Write failing tests**

Create `__tests__/format-helpers.test.ts`:

```typescript
import { wrap, FormatType } from '../lib/format-helpers'

describe('wrap', () => {
  it('bold wraps in **', () => {
    expect(wrap('bold', 'hello')).toBe('**hello**')
  })

  it('italic wraps in *', () => {
    expect(wrap('italic', 'hello')).toBe('*hello*')
  })

  it('underline wraps in <u>', () => {
    expect(wrap('underline', 'hello')).toBe('<u>hello</u>')
  })

  it('strike wraps in ~~', () => {
    expect(wrap('strike', 'hello')).toBe('~~hello~~')
  })

  it('color inserts span with color style', () => {
    expect(wrap('color', 'hello', '#ff0000')).toBe('<span style="color:#ff0000">hello</span>')
  })

  it('highlight inserts span with background-color style', () => {
    expect(wrap('highlight', 'hello', '#ffff00')).toBe('<span style="background-color:#ffff00">hello</span>')
  })

  it('fontFamily inserts span with font-family style', () => {
    expect(wrap('fontFamily', 'hello', 'Georgia')).toBe("<span style=\"font-family:'Georgia',serif\">hello</span>")
  })

  it('fontFamily handles multi-word fonts', () => {
    expect(wrap('fontFamily', 'hello', 'Times New Roman')).toBe("<span style=\"font-family:'Times New Roman',serif\">hello</span>")
  })

  it('fontSize inserts span with font-size style in px', () => {
    expect(wrap('fontSize', 'hello', '16')).toBe('<span style="font-size:16px">hello</span>')
  })

  it('fontSize does not produce double px', () => {
    const result = wrap('fontSize', 'hello', '16')
    expect(result).not.toContain('16pxpx')
  })

  it('color with undefined value does not insert the string "undefined"', () => {
    // value-requiring types should not be called without value,
    // but if they are, the output must not contain the literal string "undefined"
    const result = wrap('color', 'hello', undefined)
    expect(result).not.toContain('"undefined"')
    expect(result).not.toContain('color:undefined')
  })
})
```

- [ ] **Step 2: Run to verify they fail**

```bash
NODE_OPTIONS=--experimental-vm-modules npx jest __tests__/format-helpers.test.ts --no-coverage 2>&1 | tail -8
```

Expected: FAIL — `Cannot find module '../lib/format-helpers'`

- [ ] **Step 3: Implement `lib/format-helpers.ts`**

```typescript
export type FormatType =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strike'
  | 'color'
  | 'highlight'
  | 'fontFamily'
  | 'fontSize'

export function wrap(type: FormatType, selected: string, value?: string): string {
  switch (type) {
    case 'bold':       return `**${selected}**`
    case 'italic':     return `*${selected}*`
    case 'underline':  return `<u>${selected}</u>`
    case 'strike':     return `~~${selected}~~`
    case 'color':      return `<span style="color:${value ?? ''}">${selected}</span>`
    case 'highlight':  return `<span style="background-color:${value ?? ''}">${selected}</span>`
    case 'fontFamily': return `<span style="font-family:'${value ?? ''}',serif">${selected}</span>`
    case 'fontSize':   return `<span style="font-size:${value ?? ''}px">${selected}</span>`
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
NODE_OPTIONS=--experimental-vm-modules npx jest __tests__/format-helpers.test.ts --no-coverage 2>&1 | tail -8
```

Expected: PASS — 11 tests passing.

- [ ] **Step 5: Update jest.config.ts to include format-helpers in the node project**

The `node` project in `jest.config.ts` has an explicit `testMatch`. Add `format-helpers.test.ts`:

```typescript
testMatch: [
  '**/__tests__/markdown-to-html.test.ts',
  '**/__tests__/pdf.test.ts',
  '**/__tests__/format-helpers.test.ts',
],
```

- [ ] **Step 6: Run full suite**

```bash
NODE_OPTIONS=--experimental-vm-modules npx jest --no-coverage 2>&1 | tail -8
```

Expected: all tests passing.

- [ ] **Step 7: Commit**

```bash
git add lib/format-helpers.ts __tests__/format-helpers.test.ts jest.config.ts
git commit -m "feat: add wrap() format helper with full test coverage"
```

---

## Task 5: Create `components/FormatToolbar.tsx`

**Files:**
- Create: `components/FormatToolbar.tsx`

- [ ] **Step 1: Create FormatToolbar.tsx**

```tsx
'use client'

import { useState } from 'react'
import { FONT_OPTIONS } from '@/lib/style-settings'
import type { FontOption } from '@/lib/style-settings'
import type { FormatType } from '@/lib/format-helpers'

interface FormatToolbarProps {
  hasSelection: boolean
  onFormat: (type: FormatType, value?: string) => void
}

const FONT_SIZES = ['10', '12', '14', '16', '18', '20', '24', '28', '32', '36']

export default function FormatToolbar({ hasSelection, onFormat }: FormatToolbarProps) {
  const [showTextColor, setShowTextColor] = useState(false)
  const [showHighlight, setShowHighlight] = useState(false)
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
    </div>
  )
}
```

- [ ] **Step 2: Verify build passes**

```bash
npm run build 2>&1 | tail -8
```

Expected: `✓ Compiled successfully`

- [ ] **Step 3: Commit**

```bash
git add components/FormatToolbar.tsx
git commit -m "feat: add FormatToolbar component"
```

---

## Task 6: Update `components/Editor.tsx`

**Files:**
- Modify: `components/Editor.tsx`

- [ ] **Step 1: Update Editor.tsx to accept textareaRef + onSelect**

```tsx
'use client'

interface EditorProps {
  value: string
  onChange: (value: string) => void
  textareaRef: React.RefObject<HTMLTextAreaElement>
  onSelect: (start: number, end: number) => void
}

export default function Editor({ value, onChange, textareaRef, onSelect }: EditorProps) {
  return (
    <textarea
      ref={textareaRef}
      className="w-full h-full resize-none outline-none border-none bg-transparent leading-relaxed editor-scroll"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onSelect={(e) => {
        const t = e.currentTarget
        onSelect(t.selectionStart, t.selectionEnd)
      }}
      spellCheck={false}
      dir="auto"
      style={{
        fontFamily: 'var(--font-fira), Menlo, monospace',
        fontSize: '13.5px',
        lineHeight: '1.75',
        color: '#94a3b8',
        padding: '20px 24px',
        caretColor: '#818cf8',
        overflowY: 'auto',
        height: '100%',
      }}
    />
  )
}
```

- [ ] **Step 2: Verify build passes**

```bash
npm run build 2>&1 | tail -8
```

Expected: build error — `page.tsx` passes no `textareaRef` or `onSelect` yet. That is expected; we fix it in Task 7.

- [ ] **Step 3: Skip commit — broken until Task 7**

---

## Task 7: Wire up `app/page.tsx`

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Update app/page.tsx**

Replace the full file:

```tsx
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
  const [settings, setSettings] = useState<StyleSettings>(DEFAULT_SETTINGS)
  const [selection, setSelection] = useState({ selectionStart: 0, selectionEnd: 0 })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setSettings(loadSettings())
  }, [])

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

  function applyFormat(type: FormatType, value?: string) {
    const { selectionStart: start, selectionEnd: end } = selection
    const selected = markdown.slice(start, end)
    if (!selected) return

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
          />
          <Editor
            value={markdown}
            onChange={setMarkdown}
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
```

- [ ] **Step 2: Verify build passes**

```bash
npm run build 2>&1 | tail -10
```

Expected: `✓ Compiled successfully`

- [ ] **Step 3: Run full test suite**

```bash
NODE_OPTIONS=--experimental-vm-modules npx jest --no-coverage 2>&1 | tail -8
```

Expected: all tests passing.

- [ ] **Step 4: Commit both Editor.tsx and page.tsx together**

```bash
git add components/Editor.tsx app/page.tsx components/FormatToolbar.tsx
git commit -m "feat: wire up FormatToolbar — selection state, applyFormat, inline HTML preview"
```

---

## Task 8: Manual Smoke Test + Push

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

Open `http://localhost:3000`

- [ ] **Step 2: Verify toolbar appearance**
  - Toolbar visible as a dark strip above the editor
  - All buttons are dimmed when no text is selected
  - Selecting text activates all buttons

- [ ] **Step 3: Verify each format in preview**
  - Select a word → Bold → preview shows **bold**
  - Select a word → Italic → preview shows *italic*
  - Select a word → Underline → preview shows <u>underline</u>
  - Select a word → Strikethrough → preview shows ~~strike~~
  - Select a word → Text Color → pick red → Apply → preview shows red text
  - Select a word → Highlight → pick yellow → Apply → preview shows yellow highlight
  - Select a word → Font dropdown → pick Arial → preview shows Arial font
  - Select a word → Size dropdown → pick 24px → preview shows larger text

- [ ] **Step 4: Verify PDF export preserves formatting**
  - Apply a red text color to one word
  - Click Export PDF
  - Open the PDF — verify the word appears in red

- [ ] **Step 5: Push to GitHub**

```bash
git push origin main
```
