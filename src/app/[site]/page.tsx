import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getSite, listSites } from '@/lib/store'
import { buildMetadata } from '@/lib/seo'
import { SiteRenderer } from '@/components/SiteRenderer'

export const dynamicParams = true
// правки из админки сбрасывают кэш страницы через revalidatePath; час — страховка
export const revalidate = 3600

export async function generateStaticParams() {
  return (await listSites()).map((s) => ({ site: s.slug }))
}

export async function generateMetadata({ params }: PageProps<'/[site]'>): Promise<Metadata> {
  const site = await getSite((await params).site)
  return site ? buildMetadata(site) : {}
}

export default async function SitePage({ params }: PageProps<'/[site]'>) {
  const site = await getSite((await params).site)
  if (!site) notFound()
  return <SiteRenderer site={site} />
}
