export type FormatType =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strike'
  | 'color'
  | 'highlight'
  | 'fontFamily'
  | 'fontSize'

export function wrap(type: FormatType, selected: string, value?: string): string {
  switch (type) {
    case 'bold':       return `**${selected}**`
    case 'italic':     return `*${selected}*`
    case 'underline':  return `<u>${selected}</u>`
    case 'strike':     return `~~${selected}~~`
    case 'color':      return `<span style="color:${value ?? ''}">${selected}</span>`
    case 'highlight':  return `<span style="background-color:${value ?? ''}">${selected}</span>`
    case 'fontFamily': return `<span style="font-family:'${value ?? ''}',serif">${selected}</span>`
    case 'fontSize':   return `<span style="font-size:${value ?? ''}px">${selected}</span>`
  }
}
