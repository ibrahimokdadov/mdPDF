import { htmlToPdf, buildPuppeteerTemplate } from '../lib/pdf'

describe('htmlToPdf', () => {
  it('returns a non-empty Buffer for valid HTML', async () => {
    const html = '<html><body><h1>Hello</h1></body></html>'
    const result = await htmlToPdf(html)
    expect(result).toBeInstanceOf(Buffer)
    expect(result.length).toBeGreaterThan(0)
  }, 40000) // 40s timeout to account for Puppeteer startup
})

describe('buildPuppeteerTemplate', () => {
  it('returns empty span for empty text', () => {
    expect(buildPuppeteerTemplate('', false)).toBe('<span></span>')
  })

  it('replaces {page} with pageNumber span', () => {
    const result = buildPuppeteerTemplate('{page}', false)
    expect(result).toContain('<span class="pageNumber"></span>')
  })

  it('replaces {total} with totalPages span', () => {
    const result = buildPuppeteerTemplate('{total}', false)
    expect(result).toContain('<span class="totalPages"></span>')
  })

  it('replaces {date} with ISO date string', () => {
    const result = buildPuppeteerTemplate('{date}', false)
    expect(result).toMatch(/\d{4}-\d{2}-\d{2}/)
  })

  it('includes border-top when showLine is true', () => {
    const result = buildPuppeteerTemplate('Header', true)
    expect(result).toContain('border-top')
  })

  it('does not include border when showLine is false', () => {
    const result = buildPuppeteerTemplate('Footer', false)
    expect(result).not.toContain('border-top')
  })
})
