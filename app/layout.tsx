import type { Metadata } from 'next'
import { Fraunces, Plus_Jakarta_Sans, Fira_Code } from 'next/font/google'
import './globals.css'
import 'github-markdown-css/github-markdown.css'

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  axes: ['opsz'],
})

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
  weight: ['400', '500', '600'],
})

const firaCode = Fira_Code({
  subsets: ['latin'],
  variable: '--font-fira',
  display: 'swap',
  weight: ['400', '500'],
})

export const metadata: Metadata = {
  title: 'mdPDF',
  description: 'Convert Markdown to PDF',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${jakarta.variable} ${firaCode.variable}`}>
      <body>{children}</body>
    </html>
  )
}
