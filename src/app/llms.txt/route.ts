import { listSites } from '@/lib/store'
import { PLATFORM_URL, seoDescription, siteUrl } from '@/lib/seo'

export async function GET() {
  const sites = (await listSites()).filter((s) => s.seo.index)
  const body = [
    '# Atlas — сайты на конструкторе',
    '',
    '> Каталог сайтов, собранных на конструкторе Atlas. У каждого сайта свой llms.txt с фактами, услугами, ценами и ответами на частые вопросы.',
    '',
    '## Сайты',
    '',
    ...sites.map((s) => `- [${s.name}](${siteUrl(s)}): ${seoDescription(s)} — [llms.txt](${PLATFORM_URL}/${s.slug}/llms.txt)`),
    '',
  ].join('\n')
  return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } })
}
