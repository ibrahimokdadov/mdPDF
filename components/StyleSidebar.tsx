'use client'
import { useState } from 'react'
import type { StyleSettings } from '@/lib/style-settings'
import PageSection from './StyleSidebar/PageSection'
import TypographySection from './StyleSidebar/TypographySection'
import ColorSection from './StyleSidebar/ColorSection'
import HeaderFooterSection from './StyleSidebar/HeaderFooterSection'

interface StyleSidebarProps {
  settings: StyleSettings
  onChange: (patch: Partial<StyleSettings>) => void
  onReset: () => void
}

export default function StyleSidebar({ settings, onChange, onReset }: StyleSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div
      className="flex-shrink-0 flex flex-col bg-white overflow-hidden transition-all duration-200"
      style={{
        width: collapsed ? '40px' : '260px',
        borderRight: '1px solid #e2e8f0',
      }}
    >
      {/* Toggle button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center h-9 flex-shrink-0 border-b border-slate-100 hover:bg-slate-50 text-slate-400 hover:text-slate-600"
        title={collapsed ? 'Expand settings' : 'Collapse settings'}
      >
        <svg className={`w-4 h-4 transition-transform ${collapsed ? '' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Collapsed icon strip */}
      {collapsed && (
        <div className="flex flex-col items-center pt-3 gap-3">
          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
          </svg>
        </div>
      )}

      {/* Expanded content */}
      {!collapsed && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between px-4 h-9 border-b border-slate-100 flex-shrink-0">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.15em]">Style</span>
          </div>

          {/* Sections — scrollable */}
          <div className="flex-1 overflow-y-auto">
            <PageSection settings={settings} onChange={onChange} />
            <TypographySection settings={settings} onChange={onChange} />
            <ColorSection settings={settings} onChange={onChange} />
            <HeaderFooterSection settings={settings} onChange={onChange} />
          </div>

          {/* Reset button */}
          <div className="flex-shrink-0 p-3 border-t border-slate-100">
            <button
              onClick={onReset}
              className="w-full text-xs text-slate-400 hover:text-slate-600 py-1.5 rounded border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              Reset to defaults
            </button>
          </div>
        </>
      )}
    </div>
  )
}
