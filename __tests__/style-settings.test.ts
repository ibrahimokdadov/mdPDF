import {
  DEFAULT_SETTINGS,
  FONT_OPTIONS,
  settingsSchema,
  loadSettings,
  saveSettings,
  StyleSettings,
} from '../lib/style-settings'

describe('DEFAULT_SETTINGS', () => {
  it('has all required fields', () => {
    expect(DEFAULT_SETTINGS.pageFormat).toBe('A4')
    expect(DEFAULT_SETTINGS.pageOrientation).toBe('portrait')
    expect(DEFAULT_SETTINGS.marginTop).toBe(20)
    expect(DEFAULT_SETTINGS.bodyFont).toBe('Georgia')
    expect(DEFAULT_SETTINGS.baseFontSize).toBe(16)
    expect(DEFAULT_SETTINGS.accentColor).toBe('#6366f1')
    expect(DEFAULT_SETTINGS.footerText).toBe('{page} / {total}')
  })
})

describe('FONT_OPTIONS', () => {
  it('includes Georgia and Arial', () => {
    expect(FONT_OPTIONS).toContain('Georgia')
    expect(FONT_OPTIONS).toContain('Arial')
  })
})

describe('settingsSchema', () => {
  it('accepts valid settings', () => {
    const result = settingsSchema.safeParse(DEFAULT_SETTINGS)
    expect(result.success).toBe(true)
  })

  it('rejects unknown pageFormat', () => {
    const result = settingsSchema.safeParse({ ...DEFAULT_SETTINGS, pageFormat: 'B5' })
    expect(result.success).toBe(false)
  })

  it('rejects margin out of range', () => {
    const result = settingsSchema.safeParse({ ...DEFAULT_SETTINGS, marginTop: 200 })
    expect(result.success).toBe(false)
  })

  it('rejects invalid hex color', () => {
    const result = settingsSchema.safeParse({ ...DEFAULT_SETTINGS, accentColor: 'blue' })
    expect(result.success).toBe(false)
  })

  it('rejects headerText over 200 chars', () => {
    const result = settingsSchema.safeParse({ ...DEFAULT_SETTINGS, headerText: 'x'.repeat(201) })
    expect(result.success).toBe(false)
  })
})

describe('localStorage helpers', () => {
  const STORAGE_KEY = 'mdpdf_style_settings'

  beforeEach(() => {
    localStorage.clear()
  })

  it('loadSettings returns DEFAULT_SETTINGS when nothing stored', () => {
    const settings = loadSettings()
    expect(settings).toEqual(DEFAULT_SETTINGS)
  })

  it('saveSettings and loadSettings round-trip', () => {
    const custom: StyleSettings = { ...DEFAULT_SETTINGS, accentColor: '#ff0000' }
    saveSettings(custom)
    const loaded = loadSettings()
    expect(loaded.accentColor).toBe('#ff0000')
  })

  it('loadSettings returns DEFAULT_SETTINGS on corrupt data', () => {
    localStorage.setItem(STORAGE_KEY, 'not-json')
    const settings = loadSettings()
    expect(settings).toEqual(DEFAULT_SETTINGS)
  })

  it('loadSettings returns DEFAULT_SETTINGS on invalid shape', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ pageFormat: 'B5' }))
    const settings = loadSettings()
    expect(settings).toEqual(DEFAULT_SETTINGS)
  })
})
