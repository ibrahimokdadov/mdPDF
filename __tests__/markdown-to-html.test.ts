import { markdownToHtml } from '../lib/markdown-to-html'
import { DEFAULT_SETTINGS } from '../lib/style-settings'

describe('markdownToHtml', () => {
  it('renders an h1 heading', () => {
    const result = markdownToHtml('# Hello')
    expect(result).toContain('<h1')
    expect(result).toContain('Hello')
  })

  it('renders a code block with language class', () => {
    const result = markdownToHtml('```js\nconst x = 1\n```')
    expect(result).toContain('<code')
    expect(result).toContain('language-js')
  })

  it('renders a GFM table', () => {
    const result = markdownToHtml('| A | B |\n|---|---|\n| 1 | 2 |')
    expect(result).toContain('<table')
    expect(result).toContain('<td')
  })

  it('renders a GFM task list', () => {
    const result = markdownToHtml('- [x] Done\n- [ ] Todo')
    expect(result).toContain('type="checkbox"')
  })

  it('injects github-markdown-css into <style> tag', () => {
    const result = markdownToHtml('# test')
    expect(result).toContain('<style>')
    expect(result).toContain('markdown-body')
  })

  it('wraps content in markdown-body class', () => {
    const result = markdownToHtml('hello')
    expect(result).toContain('class="markdown-body"')
  })
})

describe('markdownToHtml with settings', () => {
  it('injects custom accent color into PDF HTML', () => {
    const settings = { ...DEFAULT_SETTINGS, accentColor: '#ff0000' }
    const result = markdownToHtml('# Hello', settings)
    expect(result).toContain('#ff0000')
  })

  it('injects custom body font into PDF HTML', () => {
    const settings = { ...DEFAULT_SETTINGS, bodyFont: 'Arial' as const }
    const result = markdownToHtml('hello', settings)
    expect(result).toContain('Arial')
  })

  it('works with no settings argument (uses defaults)', () => {
    const result = markdownToHtml('# Hello')
    expect(result).toContain('<h1')
  })
})

describe('markdownToHtml — inline HTML passthrough', () => {
  it('passes <u> tag through to output', () => {
    const result = markdownToHtml('hello <u>world</u>')
    expect(result).toContain('<u>world</u>')
  })

  it('passes <span style> through to output', () => {
    const result = markdownToHtml('<span style="color:#ff0000">red</span>')
    expect(result).toContain('color:#ff0000')
    expect(result).toContain('red')
  })
})
