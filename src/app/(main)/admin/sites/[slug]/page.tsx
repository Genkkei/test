import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/auth'
import { getSite } from '@/lib/store'
import { TEMPLATE_METAS } from '@/templates/meta'
import { FONT_NAMES } from '@/lib/fonts'
import { siteUrl } from '@/lib/seo'
import { Editor } from './Editor'

export const dynamic = 'force-dynamic'

export default async function EditSite({ params }: { params: Promise<{ slug: string }> }) {
  await requireAdmin()
  const site = await getSite((await params).slug)
  if (!site) notFound()
  return <Editor initial={site} templates={TEMPLATE_METAS} fonts={FONT_NAMES} publicUrl={siteUrl(site)} />
}
