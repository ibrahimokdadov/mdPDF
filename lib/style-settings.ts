import { z } from 'zod'

export const FONT_OPTIONS = [
  'Georgia',
  'Times New Roman',
  'Palatino',
  'Garamond',
  'Helvetica',
  'Arial',
  'Trebuchet MS',
  'Verdana',
  'Courier New',
] as const

export type FontOption = typeof FONT_OPTIONS[number]

export type StyleSettings = {
  pageFormat: 'A4' | 'Letter' | 'A3' | 'Legal' | 'Presentation'
  pageOrientation: 'portrait' | 'landscape'
  marginTop: number
  marginBottom: number
  marginLeft: number
  marginRight: number
  bodyFont: FontOption
  headingFont: FontOption
  baseFontSize: number
  lineHeight: number
  textColor: string
  accentColor: string
  linkColor: string
  backgroundColor: string
  headerText: string
  footerText: string
  showHeaderLine: boolean
  showFooterLine: boolean
}

export const DEFAULT_SETTINGS: StyleSettings = {
  pageFormat: 'A4',
  pageOrientation: 'portrait',
  marginTop: 20,
  marginBottom: 20,
  marginLeft: 20,
  marginRight: 20,
  bodyFont: 'Georgia',
  headingFont: 'Georgia',
  baseFontSize: 16,
  lineHeight: 1.6,
  textColor: '#1e293b',
  accentColor: '#6366f1',
  linkColor: '#3b82f6',
  backgroundColor: '#ffffff',
  headerText: '',
  footerText: '{page} / {total}',
  showHeaderLine: false,
  showFooterLine: true,
}

const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/)

export const settingsSchema = z.object({
  pageFormat: z.enum(['A4', 'Letter', 'A3', 'Legal', 'Presentation']),
  pageOrientation: z.enum(['portrait', 'landscape']),
  marginTop: z.number().min(0).max(100),
  marginBottom: z.number().min(0).max(100),
  marginLeft: z.number().min(0).max(100),
  marginRight: z.number().min(0).max(100),
  bodyFont: z.enum(FONT_OPTIONS),
  headingFont: z.enum(FONT_OPTIONS),
  baseFontSize: z.number().min(10).max(24),
  lineHeight: z.number().min(1.2).max(2.0),
  textColor: hexColor,
  accentColor: hexColor,
  linkColor: hexColor,
  backgroundColor: hexColor,
  headerText: z.string().max(200),
  footerText: z.string().max(200),
  showHeaderLine: z.boolean(),
  showFooterLine: z.boolean(),
})

const STORAGE_KEY = 'mdpdf_style_settings'

export function loadSettings(): StyleSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_SETTINGS
    const parsed = JSON.parse(raw)
    const result = settingsSchema.safeParse(parsed)
    return result.success ? (result.data as StyleSettings) : DEFAULT_SETTINGS
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(settings: StyleSettings): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}
