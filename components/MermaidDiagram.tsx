'use client'

import { useEffect, useRef } from 'react'
import mermaid from 'mermaid'

let initialized = false

export default function MermaidDiagram({ chart }: { chart: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!initialized) {
      mermaid.initialize({ startOnLoad: false, theme: 'default' })
      initialized = true
    }
    if (!ref.current) return
    const id = `mermaid-${Math.random().toString(36).slice(2)}`
    mermaid.render(id, chart).then(({ svg }) => {
      if (ref.current) ref.current.innerHTML = svg
    }).catch(() => {
      if (ref.current) ref.current.textContent = chart
    })
  }, [chart])

  return <div ref={ref} className="my-4" />
}
