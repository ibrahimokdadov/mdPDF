# mdPDF — Format Toolbar Design Spec

**Date:** 2026-03-25

## Overview

Add a fixed formatting toolbar at the top of the editor panel. When the user selects text and clicks a button, the selection is wrapped in markdown syntax or an HTML `<span>` and inserted back into the editor. The preview and PDF pipelines receive `rehype-raw` so inline HTML renders correctly in both.

## Architecture

A `FormatToolbar` component sits in a fixed strip above the textarea. It is always visible but all buttons are disabled when no text is selected. Selection state (`selectionStart`, `selectionEnd`) is tracked in `page.tsx` via an `onSelect` callback on the Editor. When a button is clicked, `applyFormat(type, value)` splices the wrapped text back into the markdown string and restores textarea focus.

## Toolbar Buttons

| Button | Output inserted into markdown |
|--------|-------------------------------|
| Bold | `**selected**` |
| Italic | `*selected*` |
| Underline | `<u>selected</u>` |
| Strikethrough | `~~selected~~` |
| Text Color | `<span style="color:#rrggbb">selected</span>` |
| Highlight | `<span style="background-color:#rrggbb">selected</span>` |
| Font Family | `<span style="font-family:'Name',serif">selected</span>` |
| Font Size | `<span style="font-size:Npx">selected</span>` |

- **Bold / Italic / Underline / Strikethrough** — single-click buttons, always apply immediately
- **Text Color / Highlight** — clicking opens a compact color picker (native `<input type="color">` + hex text field); applying closes it
- **Font Family** — `<select>` using `FONT_OPTIONS` from `lib/style-settings`
- **Font Size** — `<select>` with options: 10, 12, 14, 16, 18, 20, 24, 28, 32, 36 (px)

All buttons and dropdowns are disabled (opacity-40, pointer-events-none) when `selectionStart === selectionEnd`.

## Components

| File | Action | Responsibility |
|------|--------|----------------|
| `components/FormatToolbar.tsx` | Create | Toolbar UI — buttons, color pickers, font/size selects |
| `components/Editor.tsx` | Modify | Accept `textareaRef` prop + `onSelect` callback |
| `app/page.tsx` | Modify | Track selection state, implement `applyFormat`, render toolbar above editor |
| `components/Preview.tsx` | Modify | Add `rehype-raw` to ReactMarkdown plugin chain |
| `lib/markdown-to-html.ts` | Modify | Add `rehype-raw` to unified pipeline |

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
User clicks format button (e.g. Text Color → #e11d48)
        │
        ▼
applyFormat('color', '#e11d48') in page.tsx
  before = markdown.slice(0, selectionStart)
  selected = markdown.slice(selectionStart, selectionEnd)
  after = markdown.slice(selectionEnd)
  wrapped = `<span style="color:#e11d48">${selected}</span>`
  setMarkdown(before + wrapped + after)
        │
        ▼
Preview re-renders → rehype-raw passes <span> through → colored text visible
        │
        ▼
Export PDF → markdown-to-html.ts → rehype-raw → colored text in PDF
```

## applyFormat Logic

```typescript
function applyFormat(type: FormatType, value?: string) {
  const { selectionStart: start, selectionEnd: end } = selection
  const selected = markdown.slice(start, end)
  if (!selected) return

  const wrapMap: Record<FormatType, string> = {
    bold:        `**${selected}**`,
    italic:      `*${selected}*`,
    underline:   `<u>${selected}</u>`,
    strike:      `~~${selected}~~`,
    color:       `<span style="color:${value}">${selected}</span>`,
    highlight:   `<span style="background-color:${value}">${selected}</span>`,
    fontFamily:  `<span style="font-family:'${value}',serif">${selected}</span>`,
    fontSize:    `<span style="font-size:${value}px">${selected}</span>`,
  }

  const wrapped = wrapMap[type]
  setMarkdown(markdown.slice(0, start) + wrapped + markdown.slice(end))

  // Restore focus — cursor placed after the wrapped text
  requestAnimationFrame(() => {
    textareaRef.current?.focus()
    const newPos = start + wrapped.length
    textareaRef.current?.setSelectionRange(newPos, newPos)
  })
}
```

## rehype-raw Integration

Install `rehype-raw`. Add it to:
1. `Preview.tsx` — `rehypePlugins={[rehypeRaw, rehypeHighlight]}`
2. `lib/markdown-to-html.ts` — `.use(rehypeRaw)` before `.use(rehypeHighlight)`

`rehype-raw` must come before `rehype-highlight` in both pipelines.

## Toolbar Visual Design

- Same height as the panel labels row (32px)
- Background: dark editor theme (`rgba(13,20,36,0.95)`)
- Border-bottom: `1px solid rgba(255,255,255,0.06)`
- Icon buttons: 28×28px, slate-400 icons, hover: slate-200 bg-slate-800
- Dividers between button groups (simple 1px vertical line)
- Dropdowns: compact, dark-styled, same font as editor
- Disabled state: `opacity-40 pointer-events-none`

## Error Handling

| Scenario | Handling |
|----------|----------|
| Empty selection when button clicked | No-op (buttons are disabled) |
| Color picker cancelled (no change) | No-op |
| HTML in markdown fails to render | rehype-raw silently drops malformed tags |

## Testing

- **Unit:** `applyFormat` — bold wraps correctly, color inserts hex, cursor position after insertion
- **Manual:** select text → apply each format → verify preview updates; export PDF → verify formatting appears
