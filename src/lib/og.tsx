import 'server-only'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'
import type { Site } from './schema'

const dir = join(process.cwd(), 'node_modules/@fontsource/manrope/files')
const load = (f: string) => readFile(join(dir, f))

export async function ogFonts() {
  const [l5, c5, l7, c7] = await Promise.all([
    load('manrope-latin-500-normal.woff'),
    load('manrope-cyrillic-500-normal.woff'),
    load('manrope-latin-700-normal.woff'),
    load('manrope-cyrillic-700-normal.woff'),
  ])
  return [
    { name: 'Manrope', data: l5, weight: 500 as const, style: 'normal' as const },
    { name: 'Manrope', data: c5, weight: 500 as const, style: 'normal' as const },
    { name: 'Manrope', data: l7, weight: 700 as const, style: 'normal' as const },
    { name: 'Manrope', data: c7, weight: 700 as const, style: 'normal' as const },
  ]
}

/** Карточка для соцсетей в цветах сайта. В <div> с несколькими детьми обязателен display:flex. */
export async function siteOg(site: Site) {
  const t = site.theme
  const hero = site.sections.find((s) => s.type === 'hero')
  const title = (hero?.title || site.name).slice(0, 90)
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: t.bg, color: t.fg, padding: 72, fontFamily: 'Manrope', position: 'relative' }}>
        <div style={{ position: 'absolute', right: -160, top: -160, width: 640, height: 640, borderRadius: 640, background: t.accent, opacity: 0.9, display: 'flex' }} />
        <div style={{ position: 'absolute', right: 120, top: 260, width: 360, height: 360, borderRadius: 360, background: t.surface, opacity: 0.85, display: 'flex' }} />
        <div style={{ display: 'flex', fontSize: 28, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>{site.name}</div>
        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 860 }}>
          <div style={{ display: 'flex', fontSize: 66, fontWeight: 700, lineHeight: 1.04, letterSpacing: -2 }}>{title}</div>
          <div style={{ display: 'flex', marginTop: 28, fontSize: 28, fontWeight: 500, color: t.muted }}>{[site.tagline, site.business.city].filter(Boolean).join(' · ')}</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630, fonts: await ogFonts() },
  )
}

export async function siteIcon(site: Site, size: number) {
  const t = site.theme
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: t.fg, color: t.bg, borderRadius: size * 0.22, fontFamily: 'Manrope', fontWeight: 700, fontSize: size * 0.56 }}>
        {site.name.trim().charAt(0).toUpperCase()}
      </div>
    ),
    { width: size, height: size, fonts: await ogFonts() },
  )
}
