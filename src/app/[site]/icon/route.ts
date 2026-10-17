import { getSite } from '@/lib/store'
import { siteIcon } from '@/lib/og'

// Обычный маршрут, а не файловое соглашение icon.tsx: то вписывало бы в <head> свою ссылку
// /<slug>/icon поверх доменной (/icon.png) из buildMetadata.
export async function GET(_req: Request, ctx: RouteContext<'/[site]/icon'>) {
  const site = await getSite((await ctx.params).site)
  if (!site) return new Response('Not found', { status: 404 })
  return siteIcon(site, 64)
}
