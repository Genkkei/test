import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getSite, siteLangs } from '@/lib/store'
import { buildMetadata } from '@/lib/seo'
import { SiteRenderer } from '@/components/SiteRenderer'

// Рендер на каждый запрос: правка из админки видна сразу, без пересборки и сброса кэша.
export const dynamic = 'force-dynamic'


export async function generateMetadata({ params }: { params: Promise<{ site: string }> }): Promise<Metadata> {
  const slug = (await params).site
  const site = await getSite(slug)
  return site ? buildMetadata(site, await siteLangs(slug)) : {}
}

export default async function SitePage({ params }: { params: Promise<{ site: string }> }) {
  const slug = (await params).site
  const site = await getSite(slug)
  if (!site) notFound()
  return <SiteRenderer site={site} langs={await siteLangs(slug)} />
}
