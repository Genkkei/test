import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getSite, listSites, siteLangs } from '@/lib/store'
import { buildMetadata } from '@/lib/seo'
import { EXTRA_LANGS } from '@/lib/i18n'
import { SiteRenderer } from '@/components/SiteRenderer'

export const dynamicParams = true
export const revalidate = 3600

export async function generateStaticParams() {
  const out: { site: string; lang: string }[] = []
  for (const s of await listSites()) for (const lang of await siteLangs(s.slug)) if (lang !== s.lang) out.push({ site: s.slug, lang })
  return out
}

async function load(params: Promise<{ site: string; lang: string }>) {
  const { site: slug, lang } = await params
  if (!(EXTRA_LANGS as readonly string[]).includes(lang)) return null
  const langs = await siteLangs(slug)
  if (!langs.includes(lang)) return null
  const site = await getSite(slug, lang)
  return site ? { site, langs } : null
}

export async function generateMetadata({ params }: { params: Promise<{ site: string; lang: string }> }): Promise<Metadata> {
  const r = await load(params)
  return r ? buildMetadata(r.site, r.langs) : {}
}

export default async function SiteLangPage({ params }: { params: Promise<{ site: string; lang: string }> }) {
  const r = await load(params)
  if (!r) notFound()
  return <SiteRenderer site={r.site} langs={r.langs} />
}
