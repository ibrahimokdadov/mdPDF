'use client'
import SidebarSection from './SidebarSection'
import type { StyleSettings } from '@/lib/style-settings'

interface Props {
  settings: StyleSettings
  onChange: (patch: Partial<StyleSettings>) => void
}

export default function HeaderFooterSection({ settings, onChange }: Props) {
  return (
    <SidebarSection title="Header & Footer" defaultOpen={false}>
      <p className="text-[10px] text-slate-400 leading-relaxed">
        Use <code className="bg-slate-100 px-0.5 rounded">{'{page}'}</code>, <code className="bg-slate-100 px-0.5 rounded">{'{total}'}</code>, <code className="bg-slate-100 px-0.5 rounded">{'{date}'}</code> as tokens.
      </p>

      <label className="block">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">Header</span>
          <input
            type="checkbox"
            checked={settings.showHeaderLine}
            onChange={e => onChange({ showHeaderLine: e.target.checked })}
            className="accent-indigo-500"
            title="Show header line"
          />
        </div>
        <input
          type="text"
          placeholder="Header text…"
          value={settings.headerText}
          onChange={e => onChange({ headerText: e.target.value })}
          className="mt-1 w-full text-xs border border-slate-200 rounded px-2 py-1.5 bg-white text-slate-700"
        />
      </label>

      <label className="block">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">Footer</span>
          <input
            type="checkbox"
            checked={settings.showFooterLine}
            onChange={e => onChange({ showFooterLine: e.target.checked })}
            className="accent-indigo-500"
            title="Show footer line"
          />
        </div>
        <input
          type="text"
          placeholder="Footer text…"
          value={settings.footerText}
          onChange={e => onChange({ footerText: e.target.value })}
          className="mt-1 w-full text-xs border border-slate-200 rounded px-2 py-1.5 bg-white text-slate-700"
        />
      </label>
    </SidebarSection>
  )
}
