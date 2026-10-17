import { NextResponse, type NextRequest } from 'next/server'
import { listSites } from '@/lib/store'

/*
 * Свой домен сайта: запрос на shop.uz/… отдаётся как /<slug>/… конструктора.
 * Карта доменов читается из хранилища и живёт 30 с, чтобы не перечитывать файлы на каждый запрос.
 */

let cache: { at: number; map: Map<string, string> } | null = null

async function domainMap(): Promise<Map<string, string>> {
  if (cache && Date.now() - cache.at < 30_000) return cache.map
  const map = new Map<string, string>()
  for (const s of await listSites()) for (const d of s.domains) map.set(d.toLowerCase().replace(/^www\./, ''), s.slug)
  cache = { at: Date.now(), map }
  return map
}

export async function proxy(request: NextRequest) {
  const host = (request.headers.get('x-forwarded-host') || request.headers.get('host') || '').toLowerCase().replace(/:\d+$/, '').replace(/^www\./, '')
  const slug = (await domainMap()).get(host)
  if (!slug) return NextResponse.next()
  const { pathname } = request.nextUrl
  if (pathname.startsWith(`/${slug}`) || pathname.startsWith('/admin')) return NextResponse.next()
  const url = request.nextUrl.clone()
  url.pathname = `/${slug}${pathname === '/' ? '' : pathname}`
  return NextResponse.rewrite(url)
}

export const config = {
  matcher: ['/((?!_next/|api/|favicon.ico|sitemap.xml|robots.txt).*)'],
}
