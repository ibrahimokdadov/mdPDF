# mdPDF — Format Toolbar Design Spec

**Date:** 2026-03-25

## Overview

Add a fixed formatting toolbar at the top of the editor panel. When the user selects text and clicks a button, the selection is wrapped in markdown syntax or an HTML `<span>` and inserted back into the editor. The preview and PDF pipelines receive `rehype-raw` (with `allowDangerousHtml: true`) so inline HTML renders correctly in both.

## Architecture

A `FormatToolbar` component sits in a fixed strip above the textarea. It is always visible but all buttons are disabled when no text is selected. Selection state (`selectionStart`, `selectionEnd`) is tracked in `page.tsx` via an `onSelect` callback on the Editor. When a button is clicked, `applyFormat(type, value)` splices the wrapped text back into the markdown string and restores textarea focus. After applying, selection state is reset to a collapsed cursor at the new end position.

**Focus/blur problem:** Clicking a toolbar button would normally blur the textarea, collapsing the selection before `onClick` fires. All toolbar buttons use `onMouseDown` + `e.preventDefault()` to suppress the blur, preserving the selection range until `applyFormat` reads it.

## Toolbar Buttons

| Button | Output inserted into markdown |
|--------|-------------------------------|
| Bold | `**selected**` |
| Italic | `*selected*` |
| Underline | `<u>selected</u>` |
| Strikethrough | `~~selected~~` |
| Text Color | `<span style="color:#rrggbb">selected</span>` |
| Highlight | `<span style="background-color:#rrggbb">selected</span>` |
| Font Family | `<span style="font-family:'Name',serif">selected</span>` (value constrained to `FontOption` from `lib/style-settings`) |
| Font Size | `<span style="font-size:Npx">selected</span>` (value is a bare number string; `px` appended by `applyFormat`) |

- **Bold / Italic / Underline / Strikethrough** — single-click buttons, apply immediately on `onMouseDown`
- **Text Color / Highlight** — clicking opens a compact color picker (`<input type="color">` + hex text field); applying closes it
- **Font Family** — `<select>` using `FONT_OPTIONS` from `lib/style-settings`; value typed as `FontOption`
- **Font Size** — `<select>` with options: `10, 12, 14, 16, 18, 20, 24, 28, 32, 36` (bare number strings, `px` added on insertion)

All buttons and dropdowns are disabled (`opacity-40 pointer-events-none`) when `selectionStart === selectionEnd`.

## Installation

```bash
npm install rehype-raw
```

`rehype-raw` v7 is ESM-only. Already compatible — the project's other unified plugins (remark-parse, rehype-highlight etc.) are all ESM-only and work correctly via Next.js 14's bundler.

## Components

| File | Action | Responsibility |
|------|--------|----------------|
| `components/FormatToolbar.tsx` | Create | Toolbar UI — all buttons, color picker triggers, font/size selects use `onMouseDown + e.preventDefault()` to suppress textarea blur before format is applied |
| `components/Editor.tsx` | Modify | Accept `textareaRef` prop + `onSelect` callback |
| `app/page.tsx` | Modify | Track selection state, implement `applyFormat`, insert `<FormatToolbar>` inside the editor column div (between the panel labels row and the `<Editor>`) |
| `components/Preview.tsx` | Modify | Add `remarkRehypeOptions={{ allowDangerousHtml: true }}` and `rehypePlugins={[rehypeRaw, rehypeHighlight]}` |
| `lib/markdown-to-html.ts` | Modify | Change `.use(remarkRehype)` to `.use(remarkRehype, { allowDangerousHtml: true })`, add `.use(rehypeRaw)` before `.use(rehypeHighlight)` |

**Toolbar placement:** `<FormatToolbar>` is inserted inside the editor column `<div>` (the dark `flex-1` div), as a `flex-shrink-0` strip above `<Editor>`. The column itself becomes `flex flex-col`. This keeps the toolbar scoped to the editor column only — the preview column is unaffected and the existing panel labels row above is unchanged.

## Data Flow

```
User selects text in textarea
        │
        ▼
onSelect → page.tsx stores { selectionStart, selectionEnd }
        │
        ▼
FormatToolbar buttons become active
        │
User presses toolbar button (onMouseDown + e.preventDefault() — textarea stays focused)
        │
        ▼
applyFormat('color', '#e11d48') in page.tsx
  start = selection.selectionStart
  end   = selection.selectionEnd
  selected = markdown.slice(start, end)
  wrapped  = `<span style="color:#e11d48">${selected}</span>`
  setMarkdown(markdown.slice(0, start) + wrapped + markdown.slice(end))
  setSelection({ selectionStart: newPos, selectionEnd: newPos })  // reset stale state
        │
        ▼
requestAnimationFrame → textareaRef.current.setSelectionRange(newPos, newPos)
        │
        ▼
Preview re-renders → rehype-raw + allowDangerousHtml → colored text visible
        │
        ▼
Export PDF → markdown-to-html.ts → rehype-raw + allowDangerousHtml → colored text in PDF
```

## applyFormat Logic

The wrapMap is a function to avoid eagerly evaluating `value`-dependent templates when `value` is `undefined` for non-value formats (which would produce the literal string `"undefined"` in the output).

```typescript
type FormatType = 'bold' | 'italic' | 'underline' | 'strike' | 'color' | 'highlight' | 'fontFamily' | 'fontSize'

function wrap(type: FormatType, selected: string, value?: string): string {
  switch (type) {
    case 'bold':       return `**${selected}**`
    case 'italic':     return `*${selected}*`
    case 'underline':  return `<u>${selected}</u>`
    case 'strike':     return `~~${selected}~~`
    case 'color':      return `<span style="color:${value}">${selected}</span>`
    case 'highlight':  return `<span style="background-color:${value}">${selected}</span>`
    case 'fontFamily': return `<span style="font-family:'${value}',serif">${selected}</span>`
    case 'fontSize':   return `<span style="font-size:${value}px">${selected}</span>` // value is bare number string e.g. "16"
  }
}

function applyFormat(type: FormatType, value?: string) {
  const { selectionStart: start, selectionEnd: end } = selection
  const selected = markdown.slice(start, end)
  if (!selected) return

  const wrapped = wrap(type, selected, value)
  const newPos = start + wrapped.length

  setMarkdown(markdown.slice(0, start) + wrapped + markdown.slice(end))
  setSelection({ selectionStart: newPos, selectionEnd: newPos }) // reset stale state

  requestAnimationFrame(() => {
    textareaRef.current?.focus()
    textareaRef.current?.setSelectionRange(newPos, newPos)
  })
}
```

## rehype-raw Integration

Install `rehype-raw` (v7, ESM-only — compatible with existing pipeline).

**`lib/markdown-to-html.ts`:**
```typescript
.use(remarkRehype, { allowDangerousHtml: true })  // required: emits raw HTML nodes
.use(rehypeRaw)                                    // re-parses raw nodes into hast
.use(rehypeHighlight)
```

**`components/Preview.tsx`:**
```tsx
<ReactMarkdown
  remarkPlugins={[remarkGfm]}
  remarkRehypeOptions={{ allowDangerousHtml: true }}
  rehypePlugins={[rehypeRaw, rehypeHighlight]}
>
```

`rehype-raw` must come before `rehype-highlight` in both pipelines. `allowDangerousHtml: true` is required in both — without it, `remarkRehype` strips raw HTML nodes before `rehype-raw` can process them.

## Toolbar Visual Design

- Same height as the panel labels row (32px), flex-shrink-0
- Background: `rgba(13,20,36,0.95)` (dark editor theme)
- Border-bottom: `1px solid rgba(255,255,255,0.06)`
- Icon buttons: 28×28px, slate-400 icons, hover: slate-200 bg-slate-800
- Dividers between button groups (1px vertical line, `rgba(255,255,255,0.08)`)
- Dropdowns: compact, dark-styled, same font as editor
- Disabled state: `opacity-40 pointer-events-none`

## Error Handling

| Scenario | Handling |
|----------|----------|
| Empty selection | No-op — buttons are disabled |
| Color picker cancelled | No-op |
| Malformed HTML in markdown | rehype-raw drops the malformed node silently |
| Unknown font value | Constrained to `FontOption` type — impossible via the select |

**Trust model:** The markdown content is single-author. `style` attributes cannot execute JavaScript. No multi-user XSS risk exists in this architecture.

## Testing

- **Unit:** `applyFormat` — bold wraps correctly, color inserts hex, `fontSize` produces `16px` not `16pxpx`, calling `applyFormat('color', undefined)` does not insert `"undefined"` as a color value, cursor position after insertion, stale selection reset after apply
- **Manual:** select text → apply each format → verify preview updates; export PDF → verify formatting appears in PDF
