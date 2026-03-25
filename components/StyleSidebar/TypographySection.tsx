'use client'
import SidebarSection from './SidebarSection'
import { FONT_OPTIONS } from '@/lib/style-settings'
import type { StyleSettings } from '@/lib/style-settings'

interface Props {
  settings: StyleSettings
  onChange: (patch: Partial<StyleSettings>) => void
}

export default function TypographySection({ settings, onChange }: Props) {
  return (
    <SidebarSection title="Typography">
      {(['bodyFont', 'headingFont'] as const).map(key => (
        <label key={key} className="block">
          <span className="text-xs text-slate-500 capitalize">{key === 'bodyFont' ? 'Body Font' : 'Heading Font'}</span>
          <select
            value={settings[key]}
            onChange={e => onChange({ [key]: e.target.value as StyleSettings['bodyFont'] })}
            className="mt-1 w-full text-xs border border-slate-200 rounded px-2 py-1.5 bg-white text-slate-700"
          >
            {FONT_OPTIONS.map(f => <option key={f}>{f}</option>)}
          </select>
        </label>
      ))}

      <label className="block">
        <span className="text-xs text-slate-500">Font Size: {settings.baseFontSize}px</span>
        <input
          type="range" min={10} max={24} step={1}
          value={settings.baseFontSize}
          onChange={e => onChange({ baseFontSize: Number(e.target.value) })}
          className="w-full mt-1 accent-indigo-500"
        />
      </label>

      <label className="block">
        <span className="text-xs text-slate-500">Line Height: {settings.lineHeight}</span>
        <input
          type="range" min={1.2} max={2.0} step={0.1}
          value={settings.lineHeight}
          onChange={e => onChange({ lineHeight: Number(e.target.value) })}
          className="w-full mt-1 accent-indigo-500"
        />
      </label>

      <label className="block">
        <span className="text-xs text-slate-500">Text Color</span>
        <div className="flex items-center gap-2 mt-1">
          <input
            type="color"
            value={settings.textColor}
            onChange={e => onChange({ textColor: e.target.value })}
            className="w-7 h-7 rounded border border-slate-200 cursor-pointer"
          />
          <input
            type="text"
            value={settings.textColor}
            onChange={e => /^#[0-9a-fA-F]{0,6}$/.test(e.target.value) && onChange({ textColor: e.target.value })}
            className="flex-1 text-xs border border-slate-200 rounded px-2 py-1 bg-white text-slate-700 font-mono"
          />
        </div>
      </label>
    </SidebarSection>
  )
}
