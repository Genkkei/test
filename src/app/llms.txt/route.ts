import { listSites } from '@/lib/store'
import { seoDescription, siteAsset, siteUrl } from '@/lib/seo'

export async function GET() {
  const sites = (await listSites()).filter((s) => s.seo.index)
  const body = [
    '# Atlas — сайты на конструкторе',
    '',
    '> Каталог сайтов, собранных на конструкторе Atlas. У каждого сайта свой llms.txt с фактами, услугами, ценами и ответами на частые вопросы.',
    '',
    '## Сайты',
    '',
    ...sites.map((s) => `- [${s.name}](${siteUrl(s)}): ${seoDescription(s)} — [llms.txt](${siteAsset(s, 'llms')})`),
    '',
  ].join('\n')
  return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } })
}

// данные из хранилища правок — на каждый запрос
export const dynamic = 'force-dynamic'
