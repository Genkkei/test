import { getSite } from '@/lib/store'
import { siteOg } from '@/lib/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'Обложка сайта'

export default async function Image({ params }: { params: Promise<{ site: string }> }) {
  const site = await getSite((await params).site)
  if (!site) return new Response('Not found', { status: 404 })
  return siteOg(site)
}
