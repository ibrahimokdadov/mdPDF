'use client'
import SidebarSection from './SidebarSection'
import type { StyleSettings } from '@/lib/style-settings'

interface Props {
  settings: StyleSettings
  onChange: (patch: Partial<StyleSettings>) => void
}

const FORMAT_OPTIONS = ['A4', 'Letter', 'A3', 'Legal', 'Presentation'] as const

export default function PageSection({ settings, onChange }: Props) {
  const isPresentation = settings.pageFormat === 'Presentation'
  return (
    <SidebarSection title="Page">
      <label className="block">
        <span className="text-xs text-slate-500">Format</span>
        <select
          value={settings.pageFormat}
          onChange={e => onChange({ pageFormat: e.target.value as StyleSettings['pageFormat'] })}
          className="mt-1 w-full text-xs border border-slate-200 rounded px-2 py-1.5 bg-white text-slate-700"
        >
          {FORMAT_OPTIONS.map(f => <option key={f}>{f}</option>)}
        </select>
      </label>

      <label className="block">
        <span className="text-xs text-slate-500">Orientation</span>
        <select
          value={isPresentation ? 'landscape' : settings.pageOrientation}
          disabled={isPresentation}
          onChange={e => onChange({ pageOrientation: e.target.value as StyleSettings['pageOrientation'] })}
          className="mt-1 w-full text-xs border border-slate-200 rounded px-2 py-1.5 bg-white text-slate-700 disabled:opacity-50"
        >
          <option value="portrait">Portrait</option>
          <option value="landscape">Landscape</option>
        </select>
        {isPresentation && <p className="text-[10px] text-slate-400 mt-1">Presentation is always landscape</p>}
      </label>

      <div>
        <span className="text-xs text-slate-500">Margins (mm)</span>
        <div className="grid grid-cols-2 gap-2 mt-1">
          {(['marginTop', 'marginBottom', 'marginLeft', 'marginRight'] as const).map(key => (
            <label key={key} className="block">
              <span className="text-[10px] text-slate-400 capitalize">{key.replace('margin', '')}</span>
              <input
                type="number"
                min={0}
                max={100}
                value={settings[key]}
                onChange={e => onChange({ [key]: Number(e.target.value) })}
                className="w-full text-xs border border-slate-200 rounded px-2 py-1 bg-white text-slate-700"
              />
            </label>
          ))}
        </div>
      </div>
    </SidebarSection>
  )
}
