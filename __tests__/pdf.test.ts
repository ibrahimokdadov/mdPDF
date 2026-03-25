import { htmlToPdf } from '../lib/pdf'

describe('htmlToPdf', () => {
  it('returns a non-empty Buffer for valid HTML', async () => {
    const html = '<html><body><h1>Hello</h1></body></html>'
    const result = await htmlToPdf(html)
    expect(result).toBeInstanceOf(Buffer)
    expect(result.length).toBeGreaterThan(0)
  }, 40000) // 40s timeout to account for Puppeteer startup
})
