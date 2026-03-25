import { NextRequest, NextResponse } from 'next/server'
import { markdownToHtml } from '@/lib/markdown-to-html'
import { htmlToPdf } from '@/lib/pdf'
import { settingsSchema, DEFAULT_SETTINGS } from '@/lib/style-settings'
import type { StyleSettings } from '@/lib/style-settings'

const MAX_BYTES = 1 * 1024 * 1024 // 1MB

export async function POST(req: NextRequest) {
  let body: { markdown?: string; settings?: unknown }

  try {
    const text = await req.text()
    if (Buffer.byteLength(text) > MAX_BYTES) {
      return NextResponse.json({ error: 'Document too large to export' }, { status: 413 })
    }
    body = JSON.parse(text)
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { markdown } = body

  if (!markdown || markdown.trim() === '') {
    return NextResponse.json({ error: 'Nothing to export' }, { status: 400 })
  }

  // Validate settings — fall back to defaults silently on any error
  const settingsResult = settingsSchema.safeParse(body.settings)
  const settings: StyleSettings = settingsResult.success
    ? (settingsResult.data as StyleSettings)
    : DEFAULT_SETTINGS

  try {
    const html = markdownToHtml(markdown, settings)

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), 30000)
    )

    const pdfBuffer = await Promise.race([htmlToPdf(html, settings), timeoutPromise])

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="output.pdf"',
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : ''
    if (message === 'timeout') {
      return NextResponse.json({ error: 'PDF generation timed out — try again' }, { status: 504 })
    }
    console.error('PDF generation error:', err)
    return NextResponse.json({ error: 'PDF generation failed — try again' }, { status: 500 })
  }
}
