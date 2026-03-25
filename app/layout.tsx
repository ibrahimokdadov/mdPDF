import type { Metadata } from 'next'
import './globals.css'
import 'github-markdown-css/github-markdown.css'

export const metadata: Metadata = {
  title: 'mdPDF',
  description: 'Convert Markdown to PDF',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
