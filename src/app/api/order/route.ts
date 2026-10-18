import { formRefusal, hitLimit, requestIp } from '@/lib/guard'
import { hostSite } from '@/lib/auth'
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
  const refused = formRefusal(request)
  if (refused) return refused
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
  if (!body) return Response.json({ ok: false, error: 'bad' }, { status: 400 })
  if (str(body.website, 100)) return Response.json({ ok: true })
  const slug = str(body.slug, 60)
  const lang = str(body.lang, 5) || undefined
  const site = await getSite(slug, lang)
  if (!site) return Response.json({ ok: false, error: 'off' }, { status: 404 })
  const via = await hostSite()
  if (via && via !== slug) return Response.json({ ok: false, error: 'origin' }, { status: 403 })

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

  // лимиты: 5 за 10 минут с одного адреса и 30 в час на сайт — чтобы с тысячи адресов не завалить Telegram владельца
  const store = { get: kvGet, put: kvPut }
  if ((await hitLimit(store, `rl:order:${slug}:${requestIp(request)}`, 5, 600_000)) || (await hitLimit(store, `rl:order:${slug}`, 30, 3_600_000)))
    return Response.json({ ok: false, error: 'rate' }, { status: 429 })

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
