# mdPDF — Design Spec

**Date:** 2026-03-25

## Overview

A web app that converts Markdown to PDF with GitHub-style formatting. Users paste or type Markdown in an editor, see a live preview, and export to PDF with one click.

## Stack

- **Framework:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS + `github-markdown-css`
- **Editor:** Monaco Editor
- **Markdown rendering:** `react-markdown` + `remark-gfm` + `rehype-highlight`
- **PDF generation:** Puppeteer (server-side, headless Chromium)
- **Deployment:** Dockerfile → Dokku at `mdPDF.whhite.com`
- **Repository:** https://github.com/ibrahimokdadov/mdPDF

## Architecture

Two-panel layout:
- **Left panel:** Monaco editor — user types/pastes Markdown
- **Right panel:** Live preview — re-renders on every editor change (no debounce; client-side only, no network calls)

PDF export:
1. User clicks "Export PDF"
2. POST `/api/generate-pdf` with JSON body `{ markdown: string }` (`Content-Type: application/json`)
3. API route renders MD → styled HTML (`github-markdown-css` and `highlight.js` CSS read from `node_modules` at runtime and injected as `<style>` tags inline)
4. Puppeteer prints the HTML to a PDF buffer (30s timeout; returns 504 on timeout)
5. Buffer returned as `application/pdf` with `Content-Disposition: attachment; filename="output.pdf"`
6. Browser triggers immediate file download as `output.pdf`
7. Nothing is persisted server-side

## Components

| File | Responsibility |
|------|----------------|
| `/app/layout.tsx` | Root layout — global CSS imports, metadata, font loading |
| `/app/page.tsx` | Root page, two-panel layout |
| `/components/Editor.tsx` | Monaco editor wrapper, emits markdown string on change |
| `/components/Preview.tsx` | Live preview with `react-markdown`, GFM, syntax highlighting |
| `/components/ExportButton.tsx` | Calls PDF API, inline loading spinner, triggers download; filename `output.pdf` set via `Content-Disposition` header from server |
| `/app/api/generate-pdf/route.ts` | API route — receives `{ markdown }` JSON, enforces 1MB payload limit, returns PDF buffer or error |
| `/app/api/health/route.ts` | Health check — returns `{ status: "ok" }` for Dokku zero-downtime deploys |
| `/lib/markdown-to-html.ts` | Server-only pure function: markdown string → full HTML document with CSS injected inline |
| `/lib/pdf.ts` | Server-only pure function: HTML string → PDF buffer via Puppeteer (30s timeout, launched with `--no-sandbox` for Docker compatibility) |
| `Dockerfile` | Node 20 slim + `chromium` (Debian Bookworm), sets `PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium` |

## Data Flow

```
User types MD
     │
     ▼
Editor state (React useState)
     │
     ├──► Preview component (react-markdown) — instant, client-side
     │
     └──► [Export click] POST /api/generate-pdf  { markdown: string }
               │
               ▼
         markdown-to-html.ts  (server-only: MD → HTML + GitHub CSS + highlight.js CSS inline)
               │
               ▼
         pdf.ts  (server-only: HTML → PDF buffer via Puppeteer, 30s timeout)
               │
               ▼
         HTTP 200 application/pdf  Content-Disposition: attachment; filename="output.pdf"
               │
               ▼
         Browser download (output.pdf)
```

`markdown-to-html.ts` is server-only and not shared with the preview. `Preview.tsx` uses `react-markdown` directly.

## Error Handling

| Scenario | HTTP | UI message |
|----------|------|------------|
| Empty markdown | 400 | "Nothing to export" |
| Payload > 1MB | 413 | "Document too large to export" |
| Puppeteer timeout (>30s) | 504 | "PDF generation timed out — try again" |
| Puppeteer crash / unexpected error | 500 | "PDF generation failed — try again" |
| Network failure / non-200 (client fetch catch) | — | "Export failed — check your connection" |
| Puppeteer binary missing | Server refuses to start; logs clear fatal error at boot |

## Testing

- **Unit:** `markdown-to-html.ts` — headings, code blocks, tables, task lists render correctly
- **Unit:** `pdf.ts` — Puppeteer returns non-empty buffer for valid HTML
- **Manual:** Paste a GFM-rich sample, export, verify PDF visually
- **Framework:** Jest + `ts-jest`

## Deployment

### Dockerfile
- Base: `node:20-slim` (Debian Bookworm)
- APT install: `chromium` (binary at `/usr/bin/chromium`)
- `ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium`
- `ENV NODE_ENV=production`
- `EXPOSE 3000`
- Build step: `next build`
- `.dockerignore` excludes `node_modules`, `.next`, `.git`

### Dokku
- Remote: `git push dokku main` (SSH: `ibrahim@dokku-server`)
- Domain: `mdPDF.whhite.com`
- Dokku detects port 3000 via `EXPOSE` in Dockerfile
- Health check: `GET /api/health` → `{ status: "ok" }`
- No CI/CD pipeline — manual deploy via git push

### Environment Variables
- `PUPPETEER_EXECUTABLE_PATH` — set in Dockerfile; no runtime overrides needed
- No other env vars required
