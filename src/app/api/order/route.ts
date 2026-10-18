import { sendLead } from '@/lib/bot'
import { kvGet, kvPut } from '@/lib/kv'
import { getSite } from '@/lib/store'
import { money } from '@/components/shop/money'

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

/**
 * Заказ из корзины → Telegram владельца. С клиента берём только ключи товаров и количество:
 * названия и цены сервер находит сам в данных сайта, итог считает сам.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
  if (!body) return Response.json({ ok: false, error: 'bad' }, { status: 400 })
  if (str(body.website, 100)) return Response.json({ ok: true })
  const slug = str(body.slug, 60)
  const lang = str(body.lang, 5) || undefined
  const site = await getSite(slug, lang)
  if (!site) return Response.json({ ok: false, error: 'off' }, { status: 404 })

  const catalog = new Map<string, { name: string; price: number; unit: string }>()
  for (const s of site.sections) if (s.type === 'shop' && s.enabled) s.items.forEach((it, i) => it.price > 0 && catalog.set(`${s.id}:${i}`, it))
  const raw = Array.isArray(body.lines) ? (body.lines as { key?: unknown; qty?: unknown }[]).slice(0, 50) : []
  const lines = raw
    .map((l) => ({ item: catalog.get(String(l.key)), qty: Math.max(1, Math.min(99, Math.floor(Number(l.qty) || 0))) }))
    .filter((l): l is { item: { name: string; price: number; unit: string }; qty: number } => !!l.item)
  if (!lines.length) return Response.json({ ok: false, error: 'empty' }, { status: 400 })

  const name = str(body.name, 80)
  const phone = str(body.phone, 30)
  if (name.length < 2 || phone.replace(/\D/g, '').length < 7) return Response.json({ ok: false, error: 'fields' }, { status: 400 })
  if (site.listing.forSale) return Response.json({ ok: true, demo: true })
  if (!site.leads.enabled) return Response.json({ ok: false, error: 'off' }, { status: 404 })

  const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local'
  const key = `rl:order:${slug}:${ip}`
  const hits: number[] = JSON.parse((await kvGet(key)) || '[]').filter((t: number) => Date.now() - t < 600_000)
  if (hits.length >= 5) return Response.json({ ok: false, error: 'rate' }, { status: 429 })
  await kvPut(key, JSON.stringify([...hits, Date.now()]))

  const total = lines.reduce((a, l) => a + l.qty * l.item.price, 0)
  const ru = 'ru'
  const items = [
    ...lines.map((l) => `${l.item.name} × ${l.qty} = ${money(l.qty * l.item.price, ru)}`),
    `Итого: ${money(total, ru)}`,
  ].join('\n')
  const pickup = str(body.delivery, 20) === 'pickup'
  const comment = [pickup ? 'Самовывоз' : `Доставка: ${str(body.address, 200) || 'адрес не указан'}`, str(body.comment, 500)].filter(Boolean).join('\n')
  const sent = await sendLead(slug, site.name, 'order', { name, phone, date: '', time: '', items, comment }, str(body.page, 200))
  return sent ? Response.json({ ok: true }) : Response.json({ ok: false, error: 'nobot' }, { status: 503 })
}
