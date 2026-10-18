import { getSite, siteLangs } from '@/lib/store'
import { langUrl, siteAsset } from '@/lib/seo'

/** Карта сайта для его собственного домена: языковые версии с hreflang и обложкой. */
export async function GET(_req: Request, ctx: { params: Promise<{ site: string }> }) {
  const slug = (await ctx.params).site
  const site = await getSite(slug)
  if (!site || !site.seo.index) return new Response('Not found', { status: 404 })
  const langs = await siteLangs(slug)
  const day = (site.updatedAt || new Date().toISOString()).slice(0, 10)
  const alts = langs.map((l) => `<xhtml:link rel="alternate" hreflang="${l}" href="${langUrl(site, l)}"/>`).join('')
  const urls = langs.map((l) => `<url><loc>${langUrl(site, l)}</loc><lastmod>${day}</lastmod>${alts}<image:image><image:loc>${siteAsset(site, 'og')}</image:loc></image:image></url>`)
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls.join('\n')}\n</urlset>\n`
  return new Response(xml, { headers: { 'content-type': 'application/xml; charset=utf-8', 'cache-control': 'public, max-age=600' } })
}
