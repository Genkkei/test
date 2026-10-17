import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getSite, listSites, siteLangs } from '@/lib/store'
import { buildMetadata } from '@/lib/seo'
import { SiteRenderer } from '@/components/SiteRenderer'

export const dynamicParams = true
// правки из админки сбрасывают кэш страницы через revalidatePath; час — страховка
export const revalidate = 3600

export async function generateStaticParams() {
  return (await listSites()).map((s) => ({ site: s.slug }))
}

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
