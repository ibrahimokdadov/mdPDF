import puppeteer from 'puppeteer'
import type { StyleSettings } from './style-settings'
import { DEFAULT_SETTINGS } from './style-settings'

export function buildPuppeteerTemplate(text: string, showLine: boolean): string {
  if (!text) return '<span></span>'
  const html = text
    .replace('{page}', '<span class="pageNumber"></span>')
    .replace('{total}', '<span class="totalPages"></span>')
    .replace('{date}', new Date().toISOString().slice(0, 10))
  return `<div style="width:100%;font-size:10px;font-family:sans-serif;color:#64748b;padding:0 20mm;${showLine ? 'border-top:1px solid #e2e8f0;' : ''}box-sizing:border-box;">${html}</div>`
}

function getPuppeteerPageOptions(settings: StyleSettings) {
  const { pageFormat, pageOrientation, marginTop, marginBottom, marginLeft, marginRight } = settings
  const margins = {
    top: `${marginTop}mm`,
    bottom: `${marginBottom}mm`,
    left: `${marginLeft}mm`,
    right: `${marginRight}mm`,
  }

  if (pageFormat === 'Presentation') {
    return { width: '254mm', height: '143mm', margin: margins }
  }

  return {
    format: pageFormat as 'A4' | 'Letter' | 'A3' | 'Legal',
    landscape: pageOrientation === 'landscape',
    margin: margins,
  }
}

export async function htmlToPdf(html: string, settings: StyleSettings = DEFAULT_SETTINGS): Promise<Buffer> {
  const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH

  const browser = await puppeteer.launch({
    executablePath: executablePath || undefined,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  try {
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 })

    const headerTemplate = buildPuppeteerTemplate(settings.headerText, settings.showHeaderLine)
    const footerTemplate = buildPuppeteerTemplate(settings.footerText, settings.showFooterLine)
    const hasHeaderFooter = !!(settings.headerText || settings.footerText)

    const pdf = await page.pdf({
      printBackground: true,
      displayHeaderFooter: hasHeaderFooter,
      headerTemplate: hasHeaderFooter ? headerTemplate : undefined,
      footerTemplate: hasHeaderFooter ? footerTemplate : undefined,
      ...getPuppeteerPageOptions(settings),
    })
    return Buffer.from(pdf)
  } finally {
    await browser.close()
  }
}
