import { getSite } from '@/lib/store'
import { siteOg } from '@/lib/og'

export async function GET(_req: Request, ctx: { params: Promise<{ site: string }> }) {
  const site = await getSite((await ctx.params).site)
  if (!site) return new Response('Not found', { status: 404 })
  return siteOg(site)
}
