import type { Viewport } from 'next'
import '../../../globals.css'

export const viewport: Viewport = { width: 'device-width', initialScale: 1 }

// Отдельный корневой layout для языковых версий сайтов: у страницы свой <html lang>,
// поисковик и экранный диктор читают её на правильном языке.
export default async function LangLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params
  return (
    <html lang={lang} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
