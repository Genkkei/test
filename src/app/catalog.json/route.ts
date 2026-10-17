import { getSite, listSites, siteLangs } from '@/lib/store'
import { listingOf } from '@/lib/listing'

/** Каталог готовых сайтов для витрины-магазина: название, домен, описание, функционал, цена.
 *  ?lang=uz|en — карточки на этом языке (если у сайта есть перевод). */
export async function GET(request: Request) {
  const lang = new URL(request.url).searchParams.get('lang') || undefined
  const out = []
  for (const base of await listSites()) {
    if (!base.listing.forSale) continue
    const langs = await siteLangs(base.slug)
    const site = (lang && lang !== base.lang && (await getSite(base.slug, lang))) || base
    out.push(listingOf(site, langs))
  }
  return Response.json(out, { headers: { 'cache-control': 'public, max-age=300', 'access-control-allow-origin': '*' } })
}
