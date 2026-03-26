# mdPDF

Write Markdown, get a styled PDF. Live preview, custom typography, Mermaid diagrams, and a one-click diagram inserter — no LaTeX, no install.

**Live:** https://mdpdf.whhite.com

---

## Features

- **Live preview** — see your formatted document as you type
- **Mermaid diagrams** — flowcharts, sequence diagrams, ER diagrams, Gantt charts, pie charts, and more render in both preview and PDF export
- **Diagram inserter** — click "Diagram" in the toolbar, pick a type, template inserts at cursor
- **Style sidebar** — fonts, colors, line height, margins, header/footer text
- **Format toolbar** — select text and apply Bold, Italic, Underline, Strikethrough, Text Color, Highlight, Font Family, Font Size
- **PDF export** — Puppeteer renders the same output you see in the preview, including diagrams
- **File upload** — drag in any `.md` file

## Supported diagram types

| Type | Syntax |
|------|--------|
| Flowchart | `graph TD` |
| Sequence diagram | `sequenceDiagram` |
| ER diagram | `erDiagram` |
| State machine | `stateDiagram-v2` |
| Gantt chart | `gantt` |
| Pie chart | `pie` |
| Class diagram | `classDiagram` |
| Git graph | `gitGraph` |
| Mind map | `mindmap` |

## Mermaid example

````markdown
```mermaid
sequenceDiagram
  User->>API: POST /export
  API->>Puppeteer: render HTML
  Puppeteer-->>API: PDF buffer
  API-->>User: download
```
````

The diagram renders live in the preview and exports correctly to PDF.

## Self-hosting

Requires Docker (Chromium included in the image).

```bash
git clone https://github.com/ibrahimokdadov/mdPDF
cd mdPDF
docker build -t mdpdf .
docker run -p 3000:3000 mdpdf
```

Open http://localhost:3000.

## Development

```bash
npm install
npm run dev
```

Open http://localhost:3000.

```bash
npm test        # run tests
npm run build   # production build
```

## Stack

Next.js 14, TypeScript, Tailwind CSS, Puppeteer, rehype, Mermaid
