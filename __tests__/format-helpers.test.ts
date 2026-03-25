import { wrap } from '../lib/format-helpers'

describe('wrap', () => {
  it('bold wraps in **', () => {
    expect(wrap('bold', 'hello')).toBe('**hello**')
  })

  it('italic wraps in *', () => {
    expect(wrap('italic', 'hello')).toBe('*hello*')
  })

  it('underline wraps in <u>', () => {
    expect(wrap('underline', 'hello')).toBe('<u>hello</u>')
  })

  it('strike wraps in ~~', () => {
    expect(wrap('strike', 'hello')).toBe('~~hello~~')
  })

  it('color inserts span with color style', () => {
    expect(wrap('color', 'hello', '#ff0000')).toBe('<span style="color:#ff0000">hello</span>')
  })

  it('highlight inserts span with background-color style', () => {
    expect(wrap('highlight', 'hello', '#ffff00')).toBe('<span style="background-color:#ffff00">hello</span>')
  })

  it('fontFamily inserts span with font-family style', () => {
    expect(wrap('fontFamily', 'hello', 'Georgia')).toBe("<span style=\"font-family:'Georgia',serif\">hello</span>")
  })

  it('fontFamily handles multi-word fonts', () => {
    expect(wrap('fontFamily', 'hello', 'Times New Roman')).toBe("<span style=\"font-family:'Times New Roman',serif\">hello</span>")
  })

  it('fontSize inserts span with font-size style in px', () => {
    expect(wrap('fontSize', 'hello', '16')).toBe('<span style="font-size:16px">hello</span>')
  })

  it('fontSize does not produce double px', () => {
    const result = wrap('fontSize', 'hello', '16')
    expect(result).not.toContain('16pxpx')
  })

  it('color with undefined value does not insert the string "undefined"', () => {
    const result = wrap('color', 'hello', undefined)
    expect(result).not.toContain('"undefined"')
    expect(result).not.toContain('color:undefined')
  })
})
