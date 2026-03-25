import { markdownToHtml } from '../lib/markdown-to-html'

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
