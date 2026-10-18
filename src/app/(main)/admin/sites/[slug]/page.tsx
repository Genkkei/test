import { notFound } from 'next/navigation'
import { hasSitePassword, isMaster, requireSite } from '@/lib/auth'
import { botInfo } from '@/lib/bot'
import { getSite, siteLangs } from '@/lib/store'
import { TEMPLATE_METAS } from '@/templates/meta'
import { FONT_NAMES } from '@/lib/fonts'
import { langUrl } from '@/lib/seo'
import { Editor } from './Editor'

export const dynamic = 'force-dynamic'

export default async function EditSite({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ lang?: string }> }) {
  const { slug } = await params
  await requireSite(slug)
  const base = await getSite(slug)
  if (!base) notFound()
  const langs = await siteLangs(slug)
  const want = (await searchParams).lang
  const lang = want && langs.includes(want) ? want : base.lang
  const site = lang === base.lang ? base : await getSite(slug, lang)
  if (!site) notFound()
  const [master, hasPassword, bot] = await Promise.all([isMaster(), hasSitePassword(slug), botInfo(slug)])
  return (
    <Editor
      key={lang}
      initial={site}
      templates={TEMPLATE_METAS}
      fonts={FONT_NAMES}
      publicUrl={langUrl(base, lang)}
      mode={{ lang, baseLang: base.lang, langs, master, hasPassword, bot }}
    />
  )
}
