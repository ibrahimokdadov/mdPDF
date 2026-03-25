'use client'
import SidebarSection from './SidebarSection'
import type { StyleSettings } from '@/lib/style-settings'

interface Props {
  settings: StyleSettings
  onChange: (patch: Partial<StyleSettings>) => void
}

const COLOR_FIELDS: { key: keyof StyleSettings; label: string }[] = [
  { key: 'accentColor', label: 'Accent' },
  { key: 'linkColor', label: 'Links' },
  { key: 'backgroundColor', label: 'Background' },
]

export default function ColorSection({ settings, onChange }: Props) {
  return (
    <SidebarSection title="Colors">
      {COLOR_FIELDS.map(({ key, label }) => (
        <label key={key} className="block">
          <span className="text-xs text-slate-500">{label}</span>
          <div className="flex items-center gap-2 mt-1">
            <input
              type="color"
              value={settings[key] as string}
              onChange={e => onChange({ [key]: e.target.value })}
              className="w-7 h-7 rounded border border-slate-200 cursor-pointer"
            />
            <input
              type="text"
              value={settings[key] as string}
              onChange={e => /^#[0-9a-fA-F]{0,6}$/.test(e.target.value) && onChange({ [key]: e.target.value })}
              className="flex-1 text-xs border border-slate-200 rounded px-2 py-1 bg-white text-slate-700 font-mono"
            />
          </div>
        </label>
      ))}
    </SidebarSection>
  )
}
