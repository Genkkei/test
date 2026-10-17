import { listSites } from '@/lib/store'
import { listingOf } from '@/lib/listing'

/** Каталог готовых сайтов для витрины-магазина: название, домен, описание, функционал, цена. */
export async function GET() {
  const sites = (await listSites()).filter((s) => s.listing.forSale)
  return Response.json(sites.map(listingOf), { headers: { 'cache-control': 'public, max-age=300', 'access-control-allow-origin': '*' } })
}
