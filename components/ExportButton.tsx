'use client'

import { useState } from 'react'
import type { StyleSettings } from '@/lib/style-settings'

interface ExportButtonProps {
  markdown: string
  settings: StyleSettings
}

const ERROR_MESSAGES: Record<number, string> = {
  400: 'Nothing to export',
  413: 'Document too large',
  504: 'Timed out — try again',
  500: 'Generation failed — try again',
}

export default function ExportButton({ markdown, settings }: ExportButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleExport() {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markdown, settings }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? ERROR_MESSAGES[res.status] ?? 'Export failed')
        return
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'output.pdf'
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      setError('Export failed — check your connection')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <button
        onClick={handleExport}
        disabled={loading}
        className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white rounded-md transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
        style={{
          background: loading
            ? 'rgba(99,102,241,0.7)'
            : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          boxShadow: loading ? 'none' : '0 1px 2px rgba(99,102,241,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
          letterSpacing: '0.01em',
        }}
      >
        {loading ? (
          <>
            <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Generating…
          </>
        ) : (
          <>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export PDF
          </>
        )}
      </button>
      {error && (
        <span className="text-[11px] text-red-400 font-medium">{error}</span>
      )}
    </div>
  )
}
