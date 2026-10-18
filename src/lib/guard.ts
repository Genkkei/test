/*
 * Общие проверки публичных форм (заявка, заказ). Форма отправляется только со своей страницы:
 * запрос с чужого сайта (Origin другого адреса) отклоняется, тело больше 16 КБ не читается.
 */
export function formRefusal(request: Request): Response | null {
  const len = Number(request.headers.get('content-length') || 0)
  if (len > 16_384) return Response.json({ ok: false, error: 'big' }, { status: 413 })
  const origin = request.headers.get('origin')
  if (origin) {
    let host = ''
    try {
      host = new URL(origin).host
    } catch {}
    const own = [request.headers.get('x-forwarded-host'), request.headers.get('host')].filter(Boolean)
    if (!own.includes(host)) return Response.json({ ok: false, error: 'origin' }, { status: 403 })
  }
  return null
}

/** Скользящее окно: true — лимит исчерпан (попытка не записывается); иначе попытка засчитана. */
export async function hitLimit(store: { get(k: string): Promise<string | null>; put(k: string, v: string): Promise<void> }, key: string, max: number, windowMs: number, now = Date.now()): Promise<boolean> {
  let list: number[] = []
  try {
    const raw = JSON.parse((await store.get(key)) || '[]')
    if (Array.isArray(raw)) list = raw.filter((t) => typeof t === 'number' && now - t < windowMs)
  } catch {}
  if (list.length >= max) return true
  await store.put(key, JSON.stringify([...list, now].slice(-max)))
  return false
}

/** Адрес посетителя для лимитов: cf-connecting-ip ставит Cloudflare, снаружи его не подделать. */
export function requestIp(request: Request): string {
  return request.headers.get('cf-connecting-ip') || request.headers.get('x-real-ip') || 'local'
}
