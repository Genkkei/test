import type { Metadata, Viewport } from 'next'
import '../globals.css'
import { PLATFORM_URL } from '@/lib/seo'

export const metadata: Metadata = {
  metadataBase: new URL(PLATFORM_URL),
  title: { default: 'Atlas — конструктор сайтов уровня студий', template: '%s · Atlas' },
  description: 'Десять шаблонов в духе monopo, alche и Ciao Energy: WebGL, кинетическая типографика, SEO, AEO и GEO из коробки, админка для каждого сайта.',
}

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#0b0b0c' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
