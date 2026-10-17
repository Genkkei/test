import { getSite } from '@/lib/store'
import { siteIcon } from '@/lib/og'

export const size = { width: 64, height: 64 }
export const contentType = 'image/png'

export default async function Icon({ params }: { params: Promise<{ site: string }> }) {
  const site = await getSite((await params).site)
  if (!site) return new Response('Not found', { status: 404 })
  return siteIcon(site, 64)
}
