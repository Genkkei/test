import { formRefusal } from '@/lib/guard'
import { sendLead } from '@/lib/bot'
import { kvGet, kvPut } from '@/lib/kv'
import { getSite } from '@/lib/store'

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

/** Заявка с формы сайта → Telegram владельца. */
export async function POST(request: Request) {
  const refused = formRefusal(request)
  if (refused) return refused
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
  if (!body) return Response.json({ ok: false, error: 'bad' }, { status: 400 })
  // ловушка для ботов: поле невидимо человеку
  if (str(body.website, 100)) return Response.json({ ok: true })
  const slug = str(body.slug, 60)
  const site = await getSite(slug, str(body.lang, 5) || undefined)
  if (!site) return Response.json({ ok: false, error: 'off' }, { status: 404 })
  // демо из каталога: форма работает, но заявка никуда не уходит — так и говорим посетителю
  if (site.listing.forSale) return Response.json({ ok: true, demo: true })
  if (!site.leads.enabled) return Response.json({ ok: false, error: 'off' }, { status: 404 })
  const lead = { name: str(body.name, 80), phone: str(body.phone, 30), date: str(body.date, 20), time: str(body.time, 10), comment: str(body.comment, 600), items: str(body.items, 600) }
  if (lead.name.length < 2 || lead.phone.replace(/\D/g, '').length < 7) return Response.json({ ok: false, error: 'fields' }, { status: 400 })
  const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local'
  const key = `rl:lead:${slug}:${ip}`
  const hits: number[] = JSON.parse((await kvGet(key)) || '[]').filter((t: number) => Date.now() - t < 600_000)
  if (hits.length >= 5) return Response.json({ ok: false, error: 'rate' }, { status: 429 })
  await kvPut(key, JSON.stringify([...hits, Date.now()]))
  const sent = await sendLead(slug, site.name, site.leads.kind, lead, str(body.page, 200))
  return sent ? Response.json({ ok: true }) : Response.json({ ok: false, error: 'nobot' }, { status: 503 })
}
