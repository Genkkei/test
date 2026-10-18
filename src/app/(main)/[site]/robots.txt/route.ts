import { getSite } from '@/lib/store'
import { langUrl } from '@/lib/seo'

/** robots.txt для собственного домена сайта: ИИ-краулеры не закрыты — сайт должен попадать в ответы ИИ. */
export async function GET(_req: Request, ctx: { params: Promise<{ site: string }> }) {
  const site = await getSite((await ctx.params).site)
  if (!site) return new Response('Not found', { status: 404 })
  const root = langUrl(site, site.lang).replace(/\/$/, '')
  const body = site.seo.index ? `User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: ${root}/sitemap.xml\n` : 'User-agent: *\nDisallow: /\n'
  return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, max-age=600' } })
}
