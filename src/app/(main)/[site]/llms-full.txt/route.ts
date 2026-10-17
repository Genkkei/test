import { getSite } from '@/lib/store'
import { buildLlms } from '@/lib/seo'

export async function GET(_req: Request, ctx: { params: Promise<{ site: string }> }) {
  const site = await getSite((await ctx.params).site)
  if (!site) return new Response('Not found', { status: 404 })
  return new Response(buildLlms(site, true), { headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, max-age=600' } })
}
