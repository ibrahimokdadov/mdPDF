# mdPDF — Style Settings Design Spec

**Date:** 2026-03-25

## Overview

Add a collapsible right-sidebar to mdPDF that lets users control every aspect of PDF output: page format, orientation, margins, typography, colors, and header/footer text. Settings persist in `localStorage` and are sent with every PDF export request.

## Architecture

A `StyleSettings` TypeScript type is the single source of truth. The sidebar writes to it → `localStorage` persists it → the live preview reflects it via CSS variables → the API receives it alongside the markdown in the POST body → `markdown-to-html.ts` injects the values as inline CSS into the PDF HTML.

## StyleSettings Type

```typescript
// All margin values are in millimetres (mm)
type PageFormat = 'A4' | 'Letter' | 'A3' | 'Legal' | 'Presentation'
type PageOrientation = 'portrait' | 'landscape'

// Curated font list — rendered as a <select> in the sidebar
const FONT_OPTIONS = [
  'Georgia',
  'Times New Roman',
  'Palatino',
  'Garamond',
  'Helvetica',
  'Arial',
  'Trebuchet MS',
  'Verdana',
  'Courier New',
] as const
type FontOption = typeof FONT_OPTIONS[number]

type StyleSettings = {
  // Page
  pageFormat: PageFormat
  pageOrientation: PageOrientation
  marginTop: number       // mm
  marginBottom: number    // mm
  marginLeft: number      // mm
  marginRight: number     // mm

  // Typography
  bodyFont: FontOption
  headingFont: FontOption
  baseFontSize: number    // px (range: 10–24)
  lineHeight: number      // (range: 1.2–2.0)
  textColor: string       // hex only, e.g. '#1e293b'

  // Colors — hex only
  accentColor: string
  linkColor: string
  backgroundColor: string

  // Header / Footer
  headerText: string      // supports {page}, {total}, {date}
  footerText: string
  showHeaderLine: boolean
  showFooterLine: boolean
}

const DEFAULT_SETTINGS: StyleSettings = {
  pageFormat: 'A4',
  pageOrientation: 'portrait',
  marginTop: 20,
  marginBottom: 20,
  marginLeft: 20,
  marginRight: 20,
  bodyFont: 'Georgia',
  headingFont: 'Georgia',
  baseFontSize: 16,
  lineHeight: 1.6,
  textColor: '#1e293b',
  accentColor: '#6366f1',
  linkColor: '#3b82f6',
  backgroundColor: '#ffffff',
  headerText: '',
  footerText: '{page} / {total}',
  showHeaderLine: false,
  showFooterLine: true,
}
```

## Page Format → Puppeteer Mapping

| Setting | Puppeteer options |
|---------|------------------|
| A4 | `{ format: 'A4' }` |
| Letter | `{ format: 'Letter' }` |
| A3 | `{ format: 'A3' }` |
| Legal | `{ format: 'Legal' }` |
| Presentation | `{ width: '254mm', height: '143mm' }` (16:9, always landscape) |

Orientation applies to all formats except Presentation (which is fixed landscape).

## Components

| File | Action | Responsibility |
|------|--------|----------------|
| `lib/style-settings.ts` | Create | Type, FONT_OPTIONS, DEFAULT_SETTINGS, localStorage helpers, Zod validation schema |
| `lib/markdown-to-html.ts` | Modify | Accept `StyleSettings`, inject as inline `<style>` in PDF HTML, embed Google Fonts `@import` for selected fonts |
| `lib/pdf.ts` | Modify | Accept `StyleSettings`, apply pageFormat/orientation/margins to `page.pdf()` options |
| `components/StyleSidebar.tsx` | Create | Collapsible sidebar shell, toggle button, section layout, Reset button |
| `components/StyleSidebar/PageSection.tsx` | Create | Format select, orientation toggle, four margin number inputs (mm) |
| `components/StyleSidebar/TypographySection.tsx` | Create | Body/heading font selects (FONT_OPTIONS), font size slider, line height slider, text color picker |
| `components/StyleSidebar/ColorSection.tsx` | Create | Accent/link/background color pickers (hex input + color swatch) |
| `components/StyleSidebar/HeaderFooterSection.tsx` | Create | Header/footer text inputs, show/hide toggles, token hint (`{page}`, `{total}`, `{date}`) |
| `app/page.tsx` | Modify | Add sidebar to layout, pass settings to Preview and ExportButton |
| `components/Preview.tsx` | Modify | Accept settings, apply CSS variables to preview container |
| `components/ExportButton.tsx` | Modify | Include `settings` in POST body |
| `app/api/generate-pdf/route.ts` | Modify | Parse and validate settings from POST body using Zod; fall back to defaults on any validation error |

## Settings Validation (route.ts)

Use Zod to validate the `settings` field in the POST body. Rules:

```
pageFormat:      one of ['A4','Letter','A3','Legal','Presentation']
pageOrientation: one of ['portrait','landscape']
marginTop/Bottom/Left/Right: number, min 0, max 100
bodyFont/headingFont: one of FONT_OPTIONS
baseFontSize:    number, min 10, max 24
lineHeight:      number, min 1.2, max 2.0
textColor/accentColor/linkColor/backgroundColor: string matching /^#[0-9a-fA-F]{6}$/
headerText/footerText: string, max 200 chars
showHeaderLine/showFooterLine: boolean
```

If `settings` is missing or fails validation, silently use `DEFAULT_SETTINGS` — never block the export.

## Header/Footer Template Transformation

Puppeteer's `headerTemplate` / `footerTemplate` require self-contained HTML with specific class names. The user's free-text `headerText` / `footerText` strings are transformed at render time:

```typescript
function buildPuppeteerTemplate(text: string, showLine: boolean): string {
  if (!text) return '<span></span>'
  const html = text
    .replace('{page}', '<span class="pageNumber"></span>')
    .replace('{total}', '<span class="totalPages"></span>')
    .replace('{date}', new Date().toISOString().slice(0, 10))
  return `
    <div style="
      width: 100%;
      font-size: 10px;
      font-family: sans-serif;
      color: #64748b;
      padding: 0 ${20}mm;
      ${showLine ? 'border-top: 1px solid #e2e8f0;' : ''}
      box-sizing: border-box;
    ">${html}</div>
  `
}
```

This function lives in `lib/pdf.ts` and is called with `settings.headerText` / `settings.footerText`.

## Live Preview Fidelity

The preview applies settings as CSS variables — it approximates the PDF but cannot perfectly simulate page breaks, margins, or exact Puppeteer rendering. A brief note in the UI: *"Preview is approximate — export to see final layout."*

CSS variables applied to `.markdown-body` container:
```css
--md-body-font: Georgia, serif;
--md-heading-font: Georgia, serif;
--md-font-size: 16px;
--md-line-height: 1.6;
--md-text-color: #1e293b;
--md-accent-color: #6366f1;
--md-link-color: #3b82f6;
--md-bg-color: #ffffff;
```

Margins are not reflected in the preview (they only apply to the printed page).

## Data Flow

```
User adjusts sidebar control
        │
        ▼
StyleSettings state (useState in page.tsx)
        │
        ├──► localStorage.setItem immediately
        │
        ├──► Preview.tsx — CSS variables applied live
        │
        └──► [Export click] POST /api/generate-pdf
                  { markdown: string, settings: StyleSettings }
                        │
                        ▼
                route.ts — Zod validation (fallback to defaults)
                        │
                        ▼
                markdown-to-html.ts — inline CSS + Google Fonts @import
                        │
                        ▼
                pdf.ts — page.pdf() with format/orientation/margins/header/footer
                        │
                        ▼
                HTTP 200 application/pdf → browser download
```

## Sidebar UI

- Open by default, collapsible via `‹` / `›` toggle on the sidebar's left edge
- Collapsed: 40px wide (icon strip); Expanded: 260px
- Four collapsible sections: Page, Typography, Colors, Header & Footer
- "Reset to defaults" button at bottom — immediate reset, no confirmation
- Sits to the right of the preview panel

## Error Handling

| Scenario | Handling |
|----------|----------|
| Invalid/missing settings in POST | Use DEFAULT_SETTINGS silently |
| Unknown font in settings | Falls back to `'Georgia, serif'` |
| Corrupt localStorage | Parse error caught, DEFAULT_SETTINGS written back |
| Color not matching hex regex | Use default color for that field |

## Testing

- **Unit:** `lib/style-settings.ts` — defaults shape, localStorage round-trip, corrupt data fallback, Zod schema validation
- **Unit:** `lib/pdf.ts` — `buildPuppeteerTemplate` correctly replaces `{page}`, `{total}`, `{date}` tokens
- **Manual:** adjust each control, verify live preview updates, export PDF, verify PDF matches settings
