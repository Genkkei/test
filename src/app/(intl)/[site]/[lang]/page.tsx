import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getSite, siteLangs } from '@/lib/store'
import { buildMetadata } from '@/lib/seo'
import { EXTRA_LANGS } from '@/lib/i18n'
import { SiteRenderer } from '@/components/SiteRenderer'

// Рендер на каждый запрос: правка из админки видна сразу, без пересборки и сброса кэша.
export const dynamic = 'force-dynamic'


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
